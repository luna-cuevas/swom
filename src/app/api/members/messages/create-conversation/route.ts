import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logMemberAction } from '@/lib/logging';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('Creating new conversation...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { participants, listingId, hostEmail, userEmail } = await req.json();
    console.log('Participants:', participants);

    if (!participants || participants.length !== 2) {
      console.error('Invalid participants:', participants);
      return NextResponse.json(
        { error: 'Exactly two participants are required' },
        { status: 400 }
      );
    }

    // Verify both users exist in appUsers
    const { data: users, error: userError } = await supabase
      .from('appUsers')
      .select('id, name, email')
      .in('email', [hostEmail, userEmail]);

    if (userError) {
      console.error('Error checking users:', userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!users || users.length !== 2) {
      console.error('One or both users not found:', users);
      return NextResponse.json(
        { error: 'One or both users do not exist' },
        { status: 404 }
      );
    }

    // Get user IDs from the database results
    const userIds = users.map(user => user.id);

    // Check if conversation already exists between these users
    const { data: existingConversations, error: searchError } = await supabase
      .from('conversations_new')
      .select(`
        id,
        host_email,
        user_email,
        participants:conversation_participants(
          user_id,
          last_read_at,
          user:appUsers(
            id,
            name,
            email,
            profileImage
          )
        )
      `)
      .or(`and(host_email.eq."${hostEmail}",user_email.eq."${userEmail}"),and(host_email.eq."${userEmail}",user_email.eq."${hostEmail}")`);

    if (searchError) {
      console.error('Error searching for existing conversation:', searchError);
      return NextResponse.json({ error: searchError.message }, { status: 500 });
    }

    console.log('Existing conversations:', existingConversations);

    // If conversation exists, return it
    if (existingConversations && existingConversations.length > 0) {
      console.log('Found existing conversation:', existingConversations[0]);
      return NextResponse.json({ conversation: existingConversations[0] });
    }

    // Create new conversation if none exists
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations_new')
      .insert({
        host_email: hostEmail,
        user_email: userEmail,
        listing_id: listingId
      })
      .select()
      .single();

    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      return NextResponse.json({ error: conversationError.message }, { status: 500 });
    }

    console.log('Created new conversation:', conversation);

    // Add participants using the user IDs from the database
    const participantPromises = userIds.map((userId: string) => {
      console.log('Adding participant:', userId);
      return supabase.from('conversation_participants').insert({
        conversation_id: conversation.id,
        user_id: userId,
      }).select();
    });

    const participantResults = await Promise.all(participantPromises);
    console.log('Participant results:', participantResults);
    const participantErrors = participantResults.filter(result => result.error);

    if (participantErrors.length > 0) {
      console.error('Errors adding participants:', participantErrors);
      // Clean up the conversation if we couldn't add participants
      await supabase.from('conversations_new').delete().eq('id', conversation.id);
      return NextResponse.json(
        { error: 'Failed to add participants to conversation' },
        { status: 500 }
      );
    }

    // Return the newly created conversation with its ID and participants
    const { data: fullConversation, error: fetchError } = await supabase
      .from('conversations_new')
      .select(`
        id,
        created_at,
        host_email,
        user_email,
        listing_id,
        participants:conversation_participants(
          user_id,
          last_read_at,
          user:appUsers(
            id,
            name,
            email,
            profileImage
          )
        )
      `)
      .eq('id', conversation.id)
      .single();

    if (fetchError) {
      console.error('Error fetching full conversation:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log('Successfully created conversation:', fullConversation);

    // Log the conversation creation
    await logMemberAction(supabase, userIds[0], 'create_conversation', {
      conversation_id: fullConversation.id,
      participants: [hostEmail, userEmail],
      listing_id: listingId
    });

    return NextResponse.json({ conversation: fullConversation });
  } catch (error) {
    console.error('Error in create-conversation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create conversation' },
      { status: 500 }
    );
  }
} 
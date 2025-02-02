-- Create an enum for message status
CREATE TYPE message_read_status AS ENUM ('unread', 'read', 'delivered');

-- Create message_status table to track read status per user per message
CREATE TABLE message_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status message_read_status DEFAULT 'unread',
    read_at TIMESTAMPTZ,
    email_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Add RLS policies for message_status
ALTER TABLE message_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own message status"
    ON message_status
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own message status"
    ON message_status
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert message status for conversations they're part of"
    ON message_status
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM conversation_participants cp 
            WHERE cp.user_id = auth.uid() 
            AND cp.conversation_id = (
                SELECT conversation_id 
                FROM messages 
                WHERE id = message_id
            )
        )
    );

-- Create function to update conversation last_read
CREATE OR REPLACE FUNCTION update_conversation_last_read()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversation_participants
    SET last_read_at = NEW.read_at
    WHERE conversation_id = (
        SELECT conversation_id 
        FROM messages 
        WHERE id = NEW.message_id
    )
    AND user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating conversation last_read
CREATE TRIGGER update_conversation_last_read_trigger
    AFTER UPDATE OF status
    ON message_status
    FOR EACH ROW
    WHEN (NEW.status = 'read')
    EXECUTE FUNCTION update_conversation_last_read();

-- Create function to automatically create message_status entries
CREATE OR REPLACE FUNCTION create_message_status()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO message_status (message_id, user_id, status)
    SELECT 
        NEW.id,
        p.user_id,
        CASE 
            WHEN p.user_id = NEW.sender_id THEN 'read'::message_read_status
            ELSE 'unread'::message_read_status
        END
    FROM conversation_participants p
    WHERE p.conversation_id = NEW.conversation_id
    AND p.user_id != NEW.sender_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
CREATE TRIGGER create_message_status_trigger
    AFTER INSERT
    ON messages
    FOR EACH ROW
    EXECUTE FUNCTION create_message_status(); 
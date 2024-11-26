import { sanityClient } from './client';
import { supabaseClient } from '../../src/utils/supabaseClient';

// @ts-ignore

export function approveDocumentAction(props: any) {
  const isDev = process.env.NODE_ENV === 'development';
  const supabase = supabaseClient();

  return {
    label: 'Approve listing',
    onHandle: async () => {
      console.log('Approving document:', props);
      const { id, published } = props;

      if (published === undefined || !published) {
        if (typeof window !== 'undefined' && window) {
          window.alert('Document is already published');
          return;
        }
      } else {
        try {
          const query = `*[_type == "needsApproval" && _id == $id][0]`;
          const documentToApprove = await sanityClient.fetch(query, { id });

          if (!documentToApprove) {
            console.error('Document not found');
            return;
          }

          // Proceed with approval steps
          // (The logic to create users and move documents to "listing" as you've already done)

          console.log('Document approved:', documentToApprove);
        } catch (error) {
          console.error('Error in approving listing:', error);
        }
      }
    },
  };
}

export function rejectDocumentAction(props: any) {
  return {
    label: 'Reject listing',
    onHandle: async () => {
      try {
        const { id, email } = props; // Assuming the props include the listing ID and applicant's email

        const rejectionMessage = `Dear ${email},\n\nThank you for your interest in the SWOM Exchange Community. Regrettably, we cannot accommodate your application at this time. However, please know that we will keep your information on file, and should opportunities change in the future, we will be in touch.\n\nBest regards,\nSWOM Exchange Community Team`;

        // Trigger the reject email by calling the 'sendReject' endpoint
        const response = await fetch('/api/sendReject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email, // Email of the applicant
            message: rejectionMessage, // The rejection message
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send rejection email');
        }

        console.log('Rejection email sent successfully');

        // Now delete the rejected listing from Sanity
        const query = `*[_type == "listing" && _id == $id][0]`;
        const documentToReject = await sanityClient.fetch(query, { id });

        if (documentToReject) {
          await sanityClient.delete(documentToReject._id);
          console.log('Document rejected and deleted:', documentToReject._id);
        } else {
          console.error('Document not found to reject.');
        }
      } catch (error) {
        console.error('Error in rejecting listing:', error);
      }
    },
  };
}

export function improvedDelete(props: any) {
  return {
    label: 'Delete Listing',
    onHandle: async () => {

      if (typeof window !== 'undefined' && window) {
        // delete from supabase tables appUsers and listings
        const { id } = props
        const query = `*[_type == "listing" && _id == $id][0]`;
        const documentToDelete = await sanityClient.fetch(query, { id });

        if (documentToDelete) {
          const supabase = supabaseClient();

          const { data: userData, error: userDataError } = await supabase.from('appUsers').select('id').eq('email', documentToDelete.userInfo.email);
          
          if (!userData || userData.length === 0) {
            await sanityClient.delete(documentToDelete._id);

          } else {
            console.log('userData', userData);
            const { data, error } = await supabase.auth.admin.deleteUser(
              userData[0].id
            )
            if (error) {
              console.error('Error deleting user:', error);
            } else {
              await sanityClient.delete(documentToDelete._id);
              console.log('User deleted:', data);
            }
          }
        }
      }
    }
  }
}
import { sanityClient } from './client'
import { supabaseClient } from '../../src/utils/supabaseClient'
import privacyPolicy from '../schemas/privacyPolicy';
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
          let query = `*[_type == "needsApproval" && _id == $id][0]`;
          const documentToApprove = await sanityClient.fetch(query, { id });

          if (!documentToApprove) {
            console.error('Document not found');
            return;
          }



          if (documentToApprove && documentToApprove._id) {
            const { data: signUpData, error } = await supabase.auth.admin.createUser(
              {
                email: documentToApprove.userInfo.email,
                password: 'password',
                user_metadata: {
                  name: documentToApprove.userInfo.name,
                  dob: documentToApprove.userInfo.dob || '',
                  phone: documentToApprove.userInfo.phone,
                  role: 'member',
                },
                email_confirm: true,
              }
            )

            if (signUpData.user) {
              const { data: user, error: userError } = await supabase
                .from('listings')
                .insert(
                  {
                    user_id: signUpData.user.id,
                    userInfo: documentToApprove.userInfo,
                    homeInfo: documentToApprove.homeInfo,
                    amenities: documentToApprove.amenities,
                  }
                )
                .select('*');

              const { data: appUserData, error: appUserDataError } = await supabase
                .from('appUsers')
                .insert({
                  id: signUpData.user.id,
                  name: documentToApprove.userInfo.name,
                  email: documentToApprove.userInfo.email,
                  profession: documentToApprove.userInfo.profession,
                  age: documentToApprove.userInfo.age,
                  profileImage: documentToApprove.userInfo.profileImage,
                  role: 'member',
                  privacyPolicy: documentToApprove.privacyPolicy.privacyPolicy,
                  privacyPolicyDate: documentToApprove.privacyPolicy.privacyPolicyDate
                })

              const { data: resetPasswordEmail, error: resetPasswordEmailError } = await supabase.auth.resetPasswordForEmail(documentToApprove.userInfo.email, {
                redirectTo: isDev ? 'http://localhost:3000/sign-up' : 'https://swom.travel/sign-up',
              })

              console.log('resetPasswordEmail', resetPasswordEmail, 'resetPasswordEmailError', resetPasswordEmailError);

              if (!userError && !appUserDataError && !resetPasswordEmailError) {

                const newDocument = {
                  ...documentToApprove,
                  _id: signUpData.user.id,
                  _type: 'listing',
                };

                const createdListing = await sanityClient.create(newDocument);

                await sanityClient.delete(documentToApprove._id);
                console.log('User created:', user);
                console.log('Document deleted:', documentToApprove._id);
                console.log('Listing approved and moved to listings:', createdListing);
              } else {
                console.error('Error in creating user:', "userError", userError, "appUserDataError", appUserDataError, "appUserData", appUserData, "user", user, "signUpData", signUpData);

              }
            }
          }
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
        const { id } = props; // Only passing the listing ID in the props

        // Fetch the document to reject using the id
        let query = `*[_type == "needsApproval" && _id == $id][0]`;
        const documentToReject = await sanityClient.fetch(query, { id });

        // Ensure the document exists and get the email
        if (!documentToReject || !documentToReject.userInfo || !documentToReject.userInfo.email) {
          console.error('Document or email not found');
          return;
        }

        // Trigger the reject email by calling the 'sendReject' endpoint
        const response = await fetch('/api/sendRejected', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: documentToReject.userInfo.email, // Email of the applicant
            name: documentToReject.userInfo.name
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send rejection email');
        }

        console.log('Rejection email sent successfully');

        // Now delete the rejected listing from Sanity

        if (documentToReject) {
          await sanityClient.delete(id);
          console.log('Document rejected and deleted:', id);
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
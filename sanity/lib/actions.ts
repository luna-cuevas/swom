import { sanityClient } from './client'
import { supabaseClient } from '../../src/utils/supabaseClient'
// @ts-ignore


export function approveDocumentAction(props: any) {
  const isDev = process.env.NODE_ENV === 'development';
  const supabase = supabaseClient();

  const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

  async function getCurrentUserCount() {
    let { count } = await supabase
      .from('appUsers') // Assuming 'profiles' is your user table
      .select('*', { count: 'exact' });
    return count;
  }

  return {
    label: 'Approve listing',

    onHandle: async () => {
      console.log('Approving document:', props);
      const { id, published } = props
      // console.log('Approving document:', id, published);

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


          const newDocument = {
            ...documentToApprove,
            _id: undefined,
            _type: 'listing',
          };

          const customerEmail = documentToApprove.userInfo.email;

          const toSubscribe = documentToApprove.subscribed;

          if (toSubscribe) {  // Check if the Stripe customer exists or create a new one
            let customers = await stripe.customers.list({
              email: customerEmail,
              limit: 1,
            });

            let customerId;

            if (customers.data.length === 0) {
              // Create a new customer
              const customer = await stripe.customers.create({
                email: customerEmail,
                // payment_method: paymentMethod.id, // Attach the payment method  
                source: 'tok_visa'
              });
              customerId = customer.id;
            } else {
              customerId = customers.data[0].id;
              await stripe.customers.createSource(customerId, {
                source: 'tok_visa',
              });
            }

            const priceId = 'price_1ORU7BDhCJq1hRSteuSGgKDk';

            // Create the subscription
            const subscription = await stripe.subscriptions.create({
              customer: customerId,
              items: [{ price: priceId }],
              // Add any other subscription details here
            });

            console.log('Subscription created:', subscription);

            newDocument.subscribed = true;
          }

          const createdListing = await sanityClient.create(newDocument);

          console.log('Listing approved and moved to listings:', createdListing);



          const { data: userData, error } = await supabase.auth.admin.createUser({
            email: documentToApprove.userInfo.email,
            // email_confirm: true,
            // password: 'password',
            user_metadata: {
              name: documentToApprove.userInfo.name,
              dob: documentToApprove.userInfo.dob || '',
              phone: documentToApprove.userInfo.phone,
              role: 'member',
            },
          });



          if (documentToApprove && documentToApprove._id && userData.user && userData.user.id && userData.user.email) {
            console.log('userData:', userData);
            const { data: user, error: userError } = await supabase
              .from('listings')
              .insert(
                {
                  user_id: userData.user.id,
                  userInfo: documentToApprove.userInfo,
                  homeInfo: documentToApprove.homeInfo,
                  amenities: documentToApprove.amenities,
                }
              )
              .select('*');

            console.log('listing data:', user, "error", userError);

            const { data: appUserData, error: appUserDataError } = await supabase
              .from('appUsers')
              .insert({
                id: userData.user.id,
                name: documentToApprove.userInfo.name,
                email: documentToApprove.userInfo.email,
                profession: documentToApprove.userInfo.profession,
                age: documentToApprove.userInfo.age,
                profileImage: documentToApprove.userInfo.profileImage,
                role: 'member',
              })

            console.log('appUserData:', appUserData, "error", appUserDataError);

            const userCount = await getCurrentUserCount();
            console.log('userCount:', userCount);

            // if (userCount != null && userCount > 100) {
            //   const { data: inviteEmail, error } = await supabase.auth.resetPasswordForEmail(
            //     userData.user.email,
            //     {
            //       redirectTo: isDev ? 'http://localhost:3000/sign-up' : 'https://swom.travel/sign-up',
            //     }
            //   );
            // } else {
            //   const { data, error } = await supabase.auth.admin.inviteUserByEmail(userData.user.email, {
            //     redirectTo: isDev ? 'http://localhost:3000/sign-up' : 'https://swom.travel/sign-up',
            //   });
            // }
          }

          await sanityClient.delete(documentToApprove._id);

          console.log('Listing approved and moved to listings:', createdListing);
        } catch (error) {
          console.error('Error in approving listing:', error);
        }
      }

    }
  }
}

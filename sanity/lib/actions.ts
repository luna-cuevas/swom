import { sanityClient } from './client'
// @ts-ignore
import { supabaseClient } from '../../src/utils/supabaseClient.tsx';

export function approveDocumentAction(props) {
  const isDev = process.env.NODE_ENV === 'development';

  return {
    label: 'Approve listing',

    onHandle: async () => {
      const { id, published } = props

      if (!published) {

        window.alert('Must publish the document before approving it.');
        return;
      }
      const supabase = supabaseClient()

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
          _type: 'listing'
        };

        const createdListing = await sanityClient.create(newDocument);
        const { data: userCreationData, error: userCreationError } =
          await supabase.auth.resetPasswordForEmail(
            documentToApprove.userInfo.email,
            {
              redirectTo: isDev
                ? 'http://localhost:3000/sign-up'
                : 'https://swom.travel/sign-up',
            });

        await sanityClient.delete(documentToApprove._id);

        console.log('Listing approved and moved to listings:', createdListing);
      } catch (error) {
        console.error('Error in approving listing:', error);
      }

    }
  }
}

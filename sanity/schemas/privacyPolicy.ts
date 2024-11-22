import { defineType } from 'sanity';

export default defineType({
  name: 'privacyPolicy',
  title: 'Privacy Policy',
  type: 'object',
  fields: [
    {
      name: 'privacyPolicy',
      type: 'string',
      title: 'Privacy Policy',
      validation: (Rule) =>
        Rule.required().error('The privacy policy content is required.'),
    },
    {
      name: 'privacyPolicyDate',
      type: 'datetime', // Use datetime to store date and time
      title: 'Privacy Policy Date',
      description: 'The date when the privacy policy was last updated.',
      validation: (Rule) =>
        Rule.required().error('The privacy policy date is required.'),
    },
  ],
});

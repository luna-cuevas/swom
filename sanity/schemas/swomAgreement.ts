export default {
  name: 'swomAgreement',
  title: 'Swom Agreement',
  type: 'document',
  fields: [
    {
      name: 'exchangeType',
      title: 'Exchange Type',
      type: 'string',
      options: {
        list: [
          { title: 'Reciprocal', value: 'reciprocal' },
          { title: 'Non-reciprocal', value: 'non_reciprocal' }
        ]
      }
    },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'date'
    },
    {
      name: 'endDate',
      title: 'End Date',
      type: 'date'
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Accepted', value: 'accepted' },
          { title: 'Rejected', value: 'rejected' }
        ]
      },
      initialValue: 'pending'
    },
    {
      name: 'initiatorListing',
      title: 'Initiator Listing',
      type: 'reference',
      to: [{ type: 'listing' }]
    },
    {
      name: 'partnerListing',
      title: 'Partner Listing',
      type: 'reference',
      to: [{ type: 'listing' }]
    },
    {
      name: 'agreementFile',
      title: 'Agreement File',
      type: 'file'
    },
    {
      name: 'conversationId',
      title: 'Conversation ID',
      type: 'string',
      description: 'ID of the conversation where this agreement was created'
    }
  ]
} 
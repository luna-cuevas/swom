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
          { title: 'Simultaneous', value: 'simultaneous' },
          { title: 'Non-simultaneous', value: 'non_simultaneous' }
        ]
      }
    },
    {
      name: 'initiatorDetails',
      title: 'Initiator Details',
      type: 'object',
      fields: [
        {
          name: 'numberOfPeople',
          title: 'Number of People',
          type: 'number'
        },
        {
          name: 'carExchange',
          title: 'Car Exchange',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'partnerDetails',
      title: 'Partner Details',
      type: 'object',
      fields: [
        {
          name: 'numberOfPeople',
          title: 'Number of People',
          type: 'number'
        },
        {
          name: 'carExchange',
          title: 'Car Exchange',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'initiatorDates',
      title: 'Initiator Dates',
      type: 'object',
      fields: [
        {
          name: 'startDate',
          title: 'Start Date',
          type: 'date'
        },
        {
          name: 'endDate',
          title: 'End Date',
          type: 'date'
        }
      ]
    },
    {
      name: 'partnerDates',
      title: 'Partner Dates',
      type: 'object',
      fields: [
        {
          name: 'startDate',
          title: 'Start Date',
          type: 'date'
        },
        {
          name: 'endDate',
          title: 'End Date',
          type: 'date'
        }
      ]
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
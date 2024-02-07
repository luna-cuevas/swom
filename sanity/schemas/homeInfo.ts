
import { defineType } from "sanity";
export default defineType({
  name: 'homeInfo',
  title: 'Home Information',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'address', type: 'string', title: 'Address' },
    { name: 'description', type: 'text', title: 'Description' },
    {
      name: 'listingImages',
      title: 'Listing Images',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        layout: 'grid',
      }
    },
    {
      name: 'property',
      type: 'string',
      title: 'Property Type',
      options: {
        list: [
          { value: 'House', title: 'House' },
          { value: 'Apartment', title: 'Apartment' },
          { value: 'Villa', title: 'Villa' },
          { value: 'Farm', title: 'Farm' },
          { value: 'Boat', title: 'Boat' },
          { value: 'RV', title: 'RV' },
          { value: 'Other', title: 'Other' }
        ]
      }
    },
    { name: 'howManySleep', type: 'number', title: 'How Many Sleep' },
    {
      name: 'locatedIn',
      type: 'string',
      title: 'Located In',
      options: {
        list: [
          { value: 'a condominium', title: 'A Condominium' },
          { value: 'a gated community', title: 'A Gated Community' },
          { value: 'it rests freely', title: 'It Rests Freely' },
          { value: 'other', title: 'Other' }
        ]
      }
    },
    { name: 'city', type: 'string', title: 'City' },
    {
      name: 'mainOrSecond', type: 'string', title: 'Main or Second Home', options: {
        list: [
          { value: 'main', title: 'Main' },
          { value: 'second', title: 'Second' }
        ]
      }
    },
    { name: 'bathrooms', type: 'number', title: 'Bathrooms' },
    { name: 'area', type: 'string', title: 'Area' },
  ],
});

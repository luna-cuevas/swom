import { type SchemaTypeDefinition } from 'sanity'
import cityDescriptions from './schemas/cityDescriptions'
import listings from './schemas/listings'
import userInfo from './schemas/userInfo'
import homeInfo from './schemas/homeInfo'
import amenities from './schemas/amenities'
import needsApproval from './schemas/needsApproval'
import highlightedListings from './schemas/highlightedListings'
import privacyPolicy from './schemas/privacyPolicy'
import swomAgreement from './schemas/swomAgreement'

console.log(privacyPolicy); // Should log the schema definition

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cityDescriptions, listings, userInfo, homeInfo, amenities, needsApproval, highlightedListings, privacyPolicy, swomAgreement],
}

console.log(schema)

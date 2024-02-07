import { type SchemaTypeDefinition } from 'sanity'
import cityDescriptions from './schemas/cityDescriptions'
import listings from './schemas/listings'
import userInfo from './schemas/userInfo'
import homeInfo from './schemas/homeInfo'
import amenities from './schemas/amenities'
// import profileImage from './schemas/profileImage'
import needsApproval from './schemas/needsApproval'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cityDescriptions, listings, userInfo, homeInfo, amenities, needsApproval],
}

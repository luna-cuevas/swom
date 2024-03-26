/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...index]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { approveDocumentAction } from './sanity/lib/actions'
import { googleMapsInput } from '@sanity/google-maps-input'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId, authToken, useCdn } from './sanity/env';
import { schema } from './sanity/schema'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  authToken,
  schema,
  useCdn: false,
  document: {
    actions: (prev, context) => {
      return context.schemaType === 'needsApproval' ? [...prev, approveDocumentAction] : prev;
    },

  },
  plugins: [
    structureTool(),
    googleMapsInput({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    }),
    // Vision is a tool that lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})

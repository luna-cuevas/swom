import { MetadataRoute } from 'next'



export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://swom.travel';

  const staticPaths = [
    '/',
    '/home',
    '/how-it-works',
    '/membership',
    '/listings',
    '/about-us',
    '/become-member',
  ];

  const combinedPaths = [...staticPaths];

  const formattedPaths = combinedPaths.map((path) => {
    return {
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    };
  })

  return formattedPaths as MetadataRoute.Sitemap;

}
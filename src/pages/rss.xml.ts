import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog');
  const research = await getCollection('research');

  const items = [
    ...blog.map(post => ({ post, base: '/blog' })),
    ...research.map(post => ({ post, base: '/research' })),
  ]
    .filter(({ post }) => !post.data.draft)
    .sort((a, b) => b.post.data.date.valueOf() - a.post.data.date.valueOf())
    .map(({ post, base }) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `${base}/${post.id}/`,
      categories: [post.data.category, ...post.data.tags],
    }));

  return rss({
    title: 'Cybrid Lab',
    description: 'Cyber minds at the frontiers of finance, tech, and AI.',
    site: context.site!,
    items,
    customData: '<language>en-us</language>',
  });
}

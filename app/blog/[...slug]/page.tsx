import 'css/prism.css'
import 'katex/dist/katex.css'

import PageTitle from '@/components/PageTitle' /* 页面标题组件 */
import { components } from '@/components/MDXComponents' /* MDX组件 */
import { MDXLayoutRenderer } from 'pliny/mdx-components' /* MDX渲染器 */
import {
  sortPosts,
  coreContent,
  allCoreContent,
} from 'pliny/utils/contentlayer' /* 内容层排序和核心内容 */
import { allBlogs, allAuthors } from 'contentlayer/generated' /* 所有博客和作者 */
import type { Authors, Blog } from 'contentlayer/generated' /* 作者和博客类型 */
import PostSimple from '@/layouts/PostSimple' /* 简单布局 */
import PostLayout from '@/layouts/PostLayout' /* 博客布局 */
import PostBanner from '@/layouts/PostBanner' /* 博客横幅布局 */
import { Metadata } from 'next' /* 元数据 */
import siteMetadata from '@/data/siteMetadata' /* 站点元数据 */
import { notFound } from 'next/navigation' /* 找不到页面 */

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple /* 简单布局 */,
  PostLayout /* 博客布局 */,
  PostBanner /* 博客横幅布局 */,
}

/**
 * 该函数@param接受一个包含params属性的对象 作为参数，params是一个Promise，解析后是一个包含slug数组的对象。
 * 函数返回一个@returns Promise ，解析后是一个Metadata对象或undefined。
 * 
    首先，它等待props.params被解析，获取slug并解码。然后在allBlogs中查找对应的博客文章。如果文章不存在，直接返回undefined。
    接着，处理文章的作者信息，将作者的slug转换为详细信息。计算文章的发布时间和修改时间，并处理文章的图片列表，根据情况生成ogImages。
    最后，返回一个Metadata对象，包含文章的标题、描述、openGraph和twitter相关的元数据，用于优化网页在社交媒体等平台上的展示效果。
*/
export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  const post = allBlogs.find((p) => p.slug === slug)
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  if (!post) {
    return
  }

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author) => author.name)
  let imageList = [siteMetadata.socialBanner]
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images
  }
  const ogImages = imageList.map((img) => {
    return {
      url: img && img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

/**
 * 该函数@returns Promise ,
 * 解析后是一个数组，数组中的每个元素是一个包含slug属性的对象，slug是从allBlogs中每个文章的slug经过处理后得到的。
 * 
    首先，它遍历allBlogs中的每个博客文章，将每个文章的slug拆分成一个包含slug的数组，并使用decodeURI函数解码每个slug。
    然后，将解码后的slug数组作为对象的slug属性返回。
    最后，返回一个包含所有解码后的slug数组的对象。
*/
export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
}

/**
 * 该函数接受一个包含@params params属性的对象作为参数，params是一个Promise，
 * 解析后是一个包含slug数组的对象。函数返回一个JSX元素。
 * 
    首先，等待props.params被解析，获取slug并解码。然后对allBlogs进行排序和处理，找到当前文章在排序后的数组中的索引。如果文章不存在，返回notFound组件，显示 404 页面。
    接着，获取文章的上一篇和下一篇文章的信息，以及文章的详细信息、作者信息等。处理jsonLd数据，将作者信息添加到其中。
    根据文章的布局信息，从layouts对象中选择合适的布局组件。最后，返回一个包含script标签和布局组件的JSX元素，script标签用于添加jsonLd数据到页面中，布局组件用于展示文章的内容、作者信息以及导航等。
*/

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  // Filter out drafts in production
  const sortedCoreContents = allCoreContent(sortPosts(allBlogs))
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)
  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = allBlogs.find((p) => p.slug === slug) as Blog
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  const mainContent = coreContent(post)
  const jsonLd = post.structuredData
  jsonLd['author'] = authorDetails.map((author) => {
    return {
      '@type': 'Person',
      name: author.name,
    }
  })

  const Layout = layouts[post.layout || defaultLayout]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
    </>
  )
}

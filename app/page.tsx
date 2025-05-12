import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from './Main'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs) /* 排序 */
  const posts = allCoreContent(sortedPosts) /* 获取所有内容 */
  return <Main posts={posts} /> /* 渲染主组件 */
}

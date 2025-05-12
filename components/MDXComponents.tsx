import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
/**
    从 pliny/ui 导入 TOCInline、Pre 和 BlogNewsletterForm 组件，这些组件可能用于在博客页面中显示目录、代码块和新闻通讯表单。
    从 mdx/types 导入 MDXComponents 类型，用于定义 MDX 组件的类型。
    从当前目录导入 Image 和 CustomLink 组件，以及 TableWrapper 组件，这些组件可能用于处理图片、链接和表格的显示。
 */

/**
 * @param components       定义MDX中可用的组件和对HTML的映射
 * 
    components 是一个对象，用于配置在 MDX 文件中可使用的组件。
    Image 组件用于显示图片，TOCInline 组件用于显示内联目录。
    将 HTML 标签 a 映射到 CustomLink 组件，这意味着在 MDX 文件中使用 <a> 标签时，会渲染为 CustomLink 组件，可能用于自定义链接的样式和行为。
    将 HTML 标签 pre 映射到 Pre 组件，用于处理代码块的显示。
    将 HTML 标签 table 映射到 TableWrapper 组件，用于处理表格的显示。
    BlogNewsletterForm 组件用于显示新闻通讯表单。
 */
export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
}

import path from "path"
import Image from "next/image"
import { defineCollection, defineConfig } from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"
import { getHighlighter, loadTheme } from "@shikijs/compat"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode, { type Options } from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import { codeImport } from "remark-code-import"
import remarkGfm from "remark-gfm"
import { visit } from "unist-util-visit"

import { rehypeComponent } from "./lib/rehype-component"
import { rehypeNpmCommand } from "./lib/rehype-npm-command"

// async function transformMDX(document) {
//   const body = await compileMDX(context, document, {
//     ...options,
//     remarkPlugins: [remarkGfm],
//     rehypePlugins: [],
//   })
//   return {
//     ...document,
//     body,
//   }
// }

const documents = defineCollection({
  name: "Doc",
  directory: "src/content",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    published: z.boolean(),
    links: z.object({
      doc: z.string(),
      api: z.string(),
    }),
    featured: z.boolean().optional().default(false),
    component: z.boolean().optional().default(false),
    toc: z.boolean().optional().default(true),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document, {
      files: (appender) => {
        const directory = path.join(
          "src/content",
          document._meta.directory,
          "components"
        )
        appender.directory("./components", directory)
      },
      remarkPlugins: [codeImport, remarkGfm],
      // rehypePlugins: [
      //   rehypeSlug,
      //   rehypeComponent,
      //   () => (tree) => {
      //     visit(tree, (node) => {
      //       if (node?.type === "element" && node?.tagName === "pre") {
      //         const [codeEl] = node.children
      //         if (codeEl.tagName !== "code") {
      //           return
      //         }

      //         if (codeEl.data?.meta) {
      //           // Extract event from meta and pass it down the tree.
      //           const regex = /event="([^"]*)"/
      //           const match = codeEl.data?.meta.match(regex)
      //           if (match) {
      //             node.__event__ = match ? match[1] : null
      //             codeEl.data.meta = codeEl.data.meta.replace(regex, "")
      //           }
      //         }

      //         node.__rawString__ = codeEl.children?.[0].value
      //         node.__src__ = node.properties?.__src__
      //         node.__style__ = node.properties?.__style__
      //       }
      //     })
      //   },
      //   // [
      //   //   rehypePrettyCode,
      //   //   {
      //   //     getHighlighter: async () => {
      //   //       const theme = await loadTheme(
      //   //         path.join(process.cwd(), "/lib/themes/dark.json")
      //   //       )
      //   //       return await getHighlighter({ theme })
      //   //     },
      //   //     onVisitLine(node) {
      //   //       // Prevent lines from collapsing in `display: grid` mode, and allow empty
      //   //       // lines to be copy/pasted
      //   //       if (node.children.length === 0) {
      //   //         node.children = [{ type: "text", value: " " }]
      //   //       }
      //   //     },
      //   //     onVisitHighlightedLine(node) {
      //   //       node.properties.className.push("line--highlighted")
      //   //     },
      //   //     onVisitHighlightedWord(node) {
      //   //       node.properties.className = ["word--highlighted"]
      //   //     },
      //   //   } satisfies Options,
      //   // ],
      //   () => (tree) => {
      //     visit(tree, (node) => {
      //       if (node?.type === "element" && node?.tagName === "div") {
      //         if (!("data-rehype-pretty-code-fragment" in node.properties)) {
      //           return
      //         }

      //         const preElement = node.children.at(-1)
      //         if (preElement.tagName !== "pre") {
      //           return
      //         }

      //         preElement.properties["__withMeta__"] =
      //           node.children.at(0).tagName === "div"
      //         preElement.properties["__rawString__"] = node.__rawString__

      //         if (node.__src__) {
      //           preElement.properties["__src__"] = node.__src__
      //         }

      //         if (node.__event__) {
      //           preElement.properties["__event__"] = node.__event__
      //         }

      //         if (node.__style__) {
      //           preElement.properties["__style__"] = node.__style__
      //         }
      //       }
      //     })
      //   },
      //   rehypeNpmCommand,
      // rehypeAutolinkHeadings,
      // [
      //   rehypeAutolinkHeadings,
      //   {
      //     properties: {
      //       className: ["subheading-anchor"],
      //       ariaLabel: "Link to section",
      //     },
      //   },
      // ],
      // ],
    })
    return {
      ...document,
      slug: `/${document._meta.path}`,
      slugAsParams: document._meta.path.split("/").slice(1).join("/"),
      body,
    }
  },
})

export default defineConfig({
  collections: [documents],
})

import axios from 'axios'
import React, { Component } from 'react'
import { ServerStyleSheet } from 'styled-components'

// For TypeScript Resolution
import { CheckerPlugin, TsConfigPathsPlugin } from "awesome-typescript-loader"

export default {
  getRoutes: async () => {
    const { data: posts } = await axios.get('https://jsonplaceholder.typicode.com/posts')
    return [
      {
        path: '/',
      },
      {
        path: '/about',
      },
      {
        path: '/blog',
        getProps: () => ({
          posts,
        }),
        children: posts.map(post => ({
          path: `/post/${post.id}`,
          getProps: () => ({
            post,
          }),
        })),
      },
    ]
  },
  Html: class CustomHtml extends Component {
    render() {
      const { Html, Head, Body, children } = this.props

      const sheet = new ServerStyleSheet()
      const newChildren = sheet.collectStyles(children)
      const styleTags = sheet.getStyleElement()

      return (
        <Html>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            {styleTags}
          </Head>
          <Body>{newChildren}</Body>
        </Html>
      )
    }
  },
  webpack: (webpackConfigurator, { dev }) => {

    // Add .ts & .tsx extension to config
    webpackConfigurator.merge({
      resolve: {
        extensions: ['.ts', '.tsx']
      }
    })

    // We can take a look at the current Webpack Config via webpackConfigurator._config
    // Lets overwrite the default rule resolution for source files found here:
    // https://github.com/nozzle/react-static/blob/master/src/rules.js#L5

    // Update Rule to use awesome-typescript-loader
    // Extending the default ruleset with typescript support (normal webpack rule)
    let typeScriptRule = {
      test: /\.(js|jsx|ts|tsx)$/,
      // Keeping the original exclude path
      exclude: webpackConfigurator._config.module.rules[0].exclude,
      use: [
        {
          loader: 'babel-loader',
        },
        {
          loader: 'awesome-typescript-loader',
        }
      ]
    }

    // Overwrite the first (original js-transform) rule with our extended version
    webpackConfigurator._config.module.rules[0] = typeScriptRule;

    // For async error reporting of as-typescript
    webpackConfigurator.plugin("typescript-checker-plugin", CheckerPlugin)

    // For resolving potential alias paths inside the typescript.json
    webpackConfigurator.plugin("typescript-path-plugin", TsConfigPathsPlugin)

  }
}

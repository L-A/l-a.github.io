import App, { Container } from "next/app"
import { PageTransition } from "next-page-transitions"

import { readCookie } from "../helpers/cookies"
import { Translated, SetLanguage } from "../helpers/translate"

// Since this is less readable, two things are happening here:
// - One, the app is translated through a React context
// - Two, visual page transitions are all managed here

class Localized extends App {
  state = { language: this.props.language }

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    const language = readCookie("language", ctx.req) || "en"
    return { pageProps: pageProps, language: language }
  }

  switchLanguage = () => {
    const newLanguage = this.state.language == "en" ? "fr" : "en"
    this.setState({ language: newLanguage })
    SetLanguage(newLanguage)
  }

  render() {
    const { Component, pageProps } = this.props

    return (
      <Container>
        <Translated.Provider
          value={{
            language: this.state.language,
            switchLanguage: this.switchLanguage
          }}
        >
          <PageTransition
            timeout={450}
            classNames="page-transition"
            skipInitialTransition
            monkeyPatchScrolling
          >
            <Component {...pageProps} key={this.props.router.route} />
          </PageTransition>
        </Translated.Provider>
        <style jsx global>{`
          .page-transition-enter::after,
          .page-transition-enter-active::after,
          .page-transition-exit::after,
          .page-transition-exit-active::after {
            ponter-events: none;
            content: "";
            background: #1e2949;
            position: fixed;
            top: -20vh;
            left: 0;
            right: 0;
            bottom: -20vh;
          }

          .page-transition-exit::after {
            transform: translateY(120vh) skew(0, 0deg);
          }
          .page-transition-enter::after,
          .page-transition-exit-active::after {
            transform: translateY(0) skew(0, 20deg);
            transition: transform 425ms cubic-bezier(0.895, 0.03, 0.685, 0.22);
          }
          .page-transition-enter-active::after {
            transform: translateY(-120vh) skew(0, 4deg);
            transition: transform 425ms cubic-bezier(0.165, 0.84, 0.44, 1);
          }
        `}</style>
      </Container>
    )
  }
}

export default Localized
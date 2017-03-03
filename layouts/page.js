import React from 'react'
import Head from '~/components/head' // I really should change this nomenclature
import Header from '~/components/header'
import Footer from '~/components/footer'
import 'isomorphic-fetch'
import { writeCookie, readCookie } from '~/helpers/cookie'
import Piwik from '~/helpers/piwik'

const cushionURL = 'https://my.cushionapp.com/api/v1/users/745f2179-6958-4664-8549-dce939fb32e6/availability'
let availableDate = false

const defaultOpts = {
  naked: false,
  title: false
}

export default (WrappedComponent, opts) => {
  opts = {...defaultOpts, ...opts}

  return class extends React.Component {
    static async getInitialProps (ctx) {

      // Language & lang cookie
      let lang = readCookie("lang", ctx.req)
      let pageProps = {}

      writeCookie("lang", lang)
      if (WrappedComponent.getInitialProps) {
        pageProps = await WrappedComponent.getInitialProps(ctx);
      }

      // Cushion Availability (the answer is saved as the month, 0-11)
      if (availableDate == false) {
        let cushionAvailability = await fetch(cushionURL)
        let availabilityData = await cushionAvailability.json()
        availableDate = await new Date(availabilityData.availability.available_on)

         // Cushion answers that I'm available for February when we're on March 1st, so I pad it:
        availableDate.setDate(availableDate.getDate() + 2)
      }

      let availableMonth = availableDate.getMonth()

      return {...WrappedComponent.props, ...pageProps, lang: lang, availableMonth: availableMonth}
    }

    render (props) {
      if (opts.naked) {
        return (
          <div>
            <WrappedComponent {...this.props}/>
          </div>
        )
      } else {
        return (
          <div className="avenir min-vh-100">
            <Head title={opts.title} />
            <Header lang={this.props.lang} />
            <WrappedComponent {...this.props}/>
            <Footer />
            <Piwik />
          </div>
        )
      }
    }
  }
}

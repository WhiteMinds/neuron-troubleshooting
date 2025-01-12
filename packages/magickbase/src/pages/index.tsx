import { Footer, Header } from '@magickbase-website/shared'
import { TailwindToaster } from '../components/Toaster'
import { Branding } from '../components/Branding'
import { AboutUs } from '../components/About'
import { ContactUs } from '../components/ContactUs'
import { Services } from '../components/Services'
import styles from './page.module.css'
import { api } from '../utils/api'

export default function Home() {
  const aggregateStateQuery = api.uptime.aggregateState.useQuery()

  return (
    <>
      <Header />
      <Branding id="branding" className="snap-always snap-center" />
      <div className={styles.separate} />
      <AboutUs />
      <div className={styles.separate} />
      <Services className="min-h-screen snap-always snap-center" />
      <div className={styles.separate} />
      <ContactUs className="min-h-screen snap-always snap-center" />
      <Footer className="snap-always snap-center" serviceState={aggregateStateQuery.data} />
      <TailwindToaster />
    </>
  )
}

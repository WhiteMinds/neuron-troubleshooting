import { ComponentProps, forwardRef, ReactNode } from 'react'
import { clsx } from 'clsx'
import { Footer, FooterProps } from '../Footer'
import { Header, HeaderProps } from '../Header'
import styles from './index.module.scss'

type PageProps = Omit<ComponentProps<'div'>, 'children'> & {
  children?:
    | ReactNode
    | ((opts: {
        renderHeader: (props?: HeaderProps) => ReactNode
        renderFooter: (props?: FooterProps) => ReactNode
      }) => JSX.Element | undefined)
  contentWrapper?: boolean
}

export const Page = forwardRef<HTMLDivElement, PageProps>(function Page(props, ref) {
  const { children, contentWrapper = true, className, ...divProps } = props

  const finalChildren =
    typeof children === 'function' ? (
      children({
        renderHeader: props => <Header {...props} />,
        renderFooter: props => <Footer {...props} />,
      })
    ) : (
      <>
        <Header />
        {contentWrapper ? <div className={styles.contentWrapper}>{children}</div> : children}
        <Footer />
      </>
    )

  return (
    <div ref={ref} className={clsx(styles.page, className)} {...divProps}>
      {finalChildren}
    </div>
  )
})
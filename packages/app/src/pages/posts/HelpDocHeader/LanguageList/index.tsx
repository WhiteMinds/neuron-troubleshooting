import { FC } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import styles from './index.module.scss'

export const LanguageList: FC<{ languages: { name: string; localeName: string }[] }> = ({ languages }) => {
  const router = useRouter()
  const { pathname, query } = router

  return (
    <div className={styles.languages}>
      <div className={styles.title}>Language</div>
      {languages.map(language => (
        <Link
          key={language.name}
          className={clsx(styles.languageItem, {
            [styles.selected ?? '']: language.localeName === router.locale,
          })}
          href={{ pathname, query }}
          locale={language.localeName}
        >
          {language.name}
        </Link>
      ))}
    </div>
  )
}

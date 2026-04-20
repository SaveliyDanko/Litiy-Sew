import Footer from '../components/Footer';
import Header from '../components/Header';
import styles from './PrivacyPage.module.css';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Пользовательское соглашение</h1>
          <p className={styles.edition}>Редакция от «11» ноября 2025 г.</p>

          <p className={styles.intro}>
            Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между
            Индивидуальным предпринимателем Чиркиным А.А. (далее — Администрация, мы) и любым лицом,
            использующим сайт{' '}
            <a href="https://helpersew.com" className={styles.link}>https://helpersew.com</a>{' '}
            (далее — Сайт, Пользователь, вы).
          </p>
          <p className={styles.intro}>
            Сайт <a href="https://helpersew.com" className={styles.link}>https://helpersew.com</a> не является
            средством массовой информации. Заходя на Сайт, просматривая страницы, регистрируясь, размещая
            заказы либо иным образом используя Сайт, вы подтверждаете, что прочитали и приняли условия
            Соглашения. Если вы не согласны с условиями — пожалуйста, покиньте Сайт.
          </p>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Термины и документы</h2>
            <p className={styles.paragraph}>
              <strong>1.1.</strong> Сайт — интернет-ресурс по адресу{' '}
              <a href="https://helpersew.com" className={styles.link}>https://helpersew.com</a>{' '}
              и все его поддомены/разделы.
            </p>
            <p className={styles.paragraph}>
              <strong>1.2.</strong> Аккаунт — учётная запись Пользователя, создаваемая автоматически при
              первом заказе или вручную Пользователем.
            </p>
            <p className={styles.paragraph}>
              <strong>1.3.</strong> Контент — тексты, изображения, видео, инструкции, цифровые файлы
              (в т.ч. выкройки), размещённые на Сайте.
            </p>
            <p className={styles.paragraph}>
              <strong>1.4.</strong> Публичная оферта — документ, регулирующий покупку цифровых товаров:
              условия, акцепт, передача, возвраты и др. Доступна на Сайте.
            </p>
            <p className={styles.paragraph}>
              <strong>1.5.</strong> Политика конфиденциальности — правила обработки персональных данных:{' '}
              <a href="/legal/privacy" className={styles.link}>https://helpersew.com/politika-konfidetsialnosti/</a>
            </p>
            <p className={styles.paragraph}>
              <strong>1.6.</strong> В случае противоречия между Соглашением и Публичной офертой при покупке
              товаров применяются положения Публичной оферты.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Регистрация и доступ</h2>
            <p className={styles.paragraph}>
              <strong>2.1.</strong> Оформление заказов возможно без предварительной регистрации; при этом
              аккаунт может быть создан автоматически.
            </p>
            <p className={styles.paragraph}>
              <strong>2.2.</strong> Вы обязуетесь указывать достоверные данные (e-mail, имя и т.п.) и
              своевременно их обновлять.
            </p>
            <p className={styles.paragraph}>
              <strong>2.3.</strong> Вы несёте ответственность за сохранность логина и пароля, а также за
              любые действия в Аккаунте. Передача доступа третьим лицам запрещена.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Права Пользователя</h2>
            <p className={styles.paragraph}>Пользователь вправе:</p>
            <ul className={styles.list}>
              <li>просматривать Сайт и искать информацию;</li>
              <li>получать информацию, размещённую на Сайте;</li>
              <li>оставлять комментарии/отзывы при соблюдении настоящего Соглашения и законодательства;</li>
              <li>
                использовать информацию Сайта в личных некоммерческих целях при условии соблюдения
                раздела 6 (Интеллектуальная собственность).
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Обязанности Пользователя</h2>
            <p className={styles.paragraph}>Пользователь обязуется:</p>
            <ul className={styles.list}>
              <li>соблюдать законодательство РФ и условия Соглашения/Публичной оферты/Политики;</li>
              <li>
                не нарушать работу Сайта, не обходить технические ограничения, не использовать
                ботов/скрипты для сбора данных;
              </li>
              <li>
                не размещать контент незаконного, оскорбительного, вредоносного, дискриминационного
                характера, призывы к насилию, пропаганду войны, разжигание ненависти и т.п.;
              </li>
              <li>не выдавать себя за другое лицо и не вводить других Пользователей в заблуждение;</li>
              <li>не размещать спам, рекламу без согласия Администрации;</li>
              <li>не создавать несколько Аккаунтов для одного лица;</li>
              <li>при цитировании указывать источник и автора, если это допускается правом.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Права и обязанности Администрации</h2>
            <h3 className={styles.subsectionTitle}>5.1. Администрация вправе без предварительного уведомления:</h3>
            <ul className={styles.list}>
              <li>изменять/обновлять Сайт, правила использования, интерфейсы и функциональность;</li>
              <li>
                ограничивать или прекращать доступ к Сайту/Аккаунту при нарушении Соглашения или закона;
              </li>
              <li>удалять любой контент Пользователя, нарушающий правила;</li>
              <li>отказывать в регистрации/восстановлении доступа при наличии оснований.</li>
            </ul>
            <h3 className={styles.subsectionTitle}>5.2. Администрация обязуется:</h3>
            <ul className={styles.list}>
              <li>
                предпринимать разумные меры для поддержания работоспособности Сайта (если иное не
                обусловлено форс-мажором и/или работами на стороне провайдеров/партнёров);
              </li>
              <li>
                обрабатывать обращения Пользователей по вопросам доступа к приобретённым цифровым товарам;
              </li>
              <li>
                предоставлять информацию, предусмотренную законом, уполномоченным органам в предусмотренных
                случаях.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Интеллектуальная собственность и использование материалов</h2>
            <p className={styles.paragraph}>
              <strong>6.1.</strong> Исключительные права на Контент (материалы, дизайн, тексты, графику,
              логотипы, базы данных и др.), если не указано иное, принадлежат Администрации и/или
              правообладателям.
            </p>
            <p className={styles.paragraph}>
              <strong>6.2.</strong> Любое использование Контента вне рамок личных некоммерческих целей
              (воспроизведение, распространение, публикация, копирование, извлечение данных,
              «зеркалирование», модификация) без письменного разрешения правообладателя запрещено.
            </p>
            <p className={styles.paragraph}>
              <strong>6.3.</strong> Правила использования цифровых выкроек определяются Публичной офертой
              (неисключительная лицензия для личного использования, запрет распространения/передачи
              третьим лицам и т.п.).
            </p>
            <p className={styles.paragraph}>
              <strong>6.4.</strong> Размещение Пользователем материалов (отзывов, комментариев) означает,
              что он предоставляет Администрации безвозмездную неисключительную лицензию на их
              использование на срок действия прав (в том числе воспроизведение, публичное отображение,
              цитирование, переработку в целях модерации и продвижения Сайта) с указанием автора, если
              это применимо.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Комментарии и модерация</h2>
            <p className={styles.paragraph}>
              <strong>7.1.</strong> Комментарии/отзывы должны быть содержательными, не нарушать закон и правила.
            </p>
            <p className={styles.paragraph}>
              <strong>7.2.</strong> Мы вправе модерировать/удалять материалы, противоречащие
              Соглашению/закону/этическим нормам, а также ограничивать возможность комментирования.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Покупка цифровых товаров</h2>
            <p className={styles.paragraph}>
              <strong>8.1.</strong> Условия покупки, оплаты, предоставления доступа, возвратов, лицензии
              на выкройки и др. регулируются Публичной офертой (акцепт — оплата; передача — e-mail/личный
              кабинет; сроки, ограничения и т.д.).
            </p>
            <p className={styles.paragraph}>
              <strong>8.2.</strong> Ссылка на правила заказа:{' '}
              <a href="https://helpersew.com/usloviya-zakaza/" className={styles.link}>
                https://helpersew.com/usloviya-zakaza/
              </a>
            </p>
            <p className={styles.paragraph}>
              <strong>8.3.</strong> Условия возврата/обмена:{' '}
              <a href="https://helpersew.com/vozvrat-i-obmen/" className={styles.link}>
                https://helpersew.com/vozvrat-i-obmen/
              </a>
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Персональные данные и рассылки</h2>
            <p className={styles.paragraph}>
              <strong>9.1.</strong> Обработка персональных данных осуществляется по Политике
              конфиденциальности:{' '}
              <a href="/legal/privacy" className={styles.link}>
                https://helpersew.com/politika-konfidetsialnosti/
              </a>
            </p>
            <p className={styles.paragraph}>
              <strong>9.2.</strong> Сервисные уведомления (о заказах/доступе/поддержке) направляются на
              указанный вами e-mail/телефон.
            </p>
            <p className={styles.paragraph}>
              <strong>9.3.</strong> Рекламные и маркетинговые сообщения направляются только при наличии
              отдельного согласия, которое можно отозвать в любой момент.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Гарантии и ответственность</h2>
            <p className={styles.paragraph}>
              <strong>10.1.</strong> Сайт и его сервисы предоставляются «как есть» (as is). Мы не гарантируем
              отсутствия ошибок, бесперебойности, совместимости с вашим оборудованием/ПО, а также того,
              что дефекты будут исправлены в конкретный срок.
            </p>
            <p className={styles.paragraph}>
              <strong>10.2.</strong> Администрация не отвечает за услуги и ресурсы третьих лиц (платёжные
              сервисы, почтовые/телеком-провайдеры, хостинг и др.), а также за действия Пользователей.
            </p>
            <p className={styles.paragraph}>
              <strong>10.3.</strong> Администрация не несёт ответственности за утрату данных/доступа,
              возникшую по вине Пользователя (передача пароля, вредоносное ПО, утечка e-mail и т.п.).
            </p>
            <p className={styles.paragraph}>
              <strong>10.4.</strong> В пределах, допустимых законом, наша ответственность ограничена
              фактическим документально подтверждённым ущербом и не включает упущенную выгоду.
            </p>
            <p className={styles.paragraph}>
              <strong>10.5.</strong> Форс-мажор: мы освобождаемся от ответственности за невыполнение
              обязательств, вызванное обстоятельствами непреодолимой силы (ЧС, военные действия, акты
              органов власти, сбои глобальных сетей и пр.) на период их действия.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Коммуникации и поддержка</h2>
            <p className={styles.paragraph}>
              <strong>11.1.</strong> По вопросам работы Сайта и доступа к приобретённым цифровым товарам
              обращайтесь на{' '}
              <a href="mailto:patterns@helpersew.com" className={styles.link}>patterns@helpersew.com</a>
            </p>
            <p className={styles.paragraph}>
              <strong>11.2.</strong> Сроки реагирования и порядок рассмотрения обращений определяются
              внутренним регламентом и Публичной офертой.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>12. Изменение Соглашения</h2>
            <p className={styles.paragraph}>
              <strong>12.1.</strong> Мы вправе в одностороннем порядке изменять Соглашение. Актуальная
              редакция публикуется на Сайте и вступает в силу с момента публикации, если прямо не указано
              иное.
            </p>
            <p className={styles.paragraph}>
              <strong>12.2.</strong> Продолжая использовать Сайт после изменения Соглашения, вы
              подтверждаете согласие с новой редакцией.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>13. Заключительные положения</h2>
            <p className={styles.paragraph}>
              <strong>13.1.</strong> К отношениям сторон применяется законодательство Российской Федерации.
            </p>
            <p className={styles.paragraph}>
              <strong>13.2.</strong> Недействительность отдельного положения не влечёт недействительность
              Соглашения в целом.
            </p>
            <p className={styles.paragraph}>
              <strong>13.3.</strong> Заголовки разделов используются для удобства и не влияют на толкование.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

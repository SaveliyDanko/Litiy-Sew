import Footer from '../components/Footer';
import Header from '../components/Header';
import styles from './PrivacyPage.module.css';

export default function OfferPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Публичная оферта</h1>

          <p className={styles.intro}>
            Настоящий документ является публичной офертой в соответствии со ст. 437 ГК РФ.
          </p>
          <p className={styles.intro}>
            Оформляя и оплачивая заказ на сайте либо иным способом становясь клиентом нашей компании,
            вы акцептуете настоящую оферту. Оферта действует с 27.05.2019 (в актуальной редакции —
            с момента публикации на Сайте).
          </p>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Общие понятия</h2>
            <p className={styles.paragraph}>
              <strong>1.1.</strong> Посетитель Сайта — лицо, пришедшее на сайт{' '}
              <a href="https://www.helpersew.com" className={styles.link}>https://www.helpersew.com</a>{' '}
              без цели размещения заказа.
            </p>
            <p className={styles.paragraph}>
              <strong>1.2.</strong> Пользователь — физическое лицо, посетитель Сайта, принимающий условия
              настоящего Соглашения (оферты) и желающий разместить Заказы в интернет-магазине{' '}
              <a href="https://www.helpersew.com" className={styles.link}>https://www.helpersew.com</a>.
            </p>
            <p className={styles.paragraph}>
              <strong>1.3.</strong> Покупатель — Пользователь, разместивший Заказ в интернет-магазине{' '}
              <a href="https://www.helpersew.com" className={styles.link}>https://www.helpersew.com</a>.
            </p>
            <p className={styles.paragraph}>
              <strong>1.4.</strong> Продавец — Индивидуальный предприниматель Чиркин Алексей Анатольевич,
              ИНН 280803300706, ОГРНИП 317280100012222, адрес: 630102, Российская Федерация,
              Новосибирская область, г. Новосибирск, ул. Восход, д. 20, офис 806.
            </p>
            <p className={styles.paragraph}>
              <strong>1.5.</strong> Seller — Aleksey Anatolyevich Chirkin, Individual Entrepreneur,
              TIN 280803300706, OGRNIP 317280100012222, address: 630102, Russian Federation, Novosibirsk,
              20 Voskhod St., office 806.
            </p>
            <p className={styles.paragraph}>
              <strong>1.6.</strong> Интернет-магазин — сайт Продавца по адресу{' '}
              <a href="https://www.helpersew.com" className={styles.link}>https://www.helpersew.com</a>,
              где представлены товары и условия их приобретения.
            </p>
            <p className={styles.paragraph}>
              <strong>1.7.</strong> Сайт —{' '}
              <a href="https://www.helpersew.com" className={styles.link}>https://www.helpersew.com</a>.
            </p>
            <p className={styles.paragraph}>
              <strong>1.8.</strong> Товар — цифровые выкройки и иные товары/услуги, представленные к
              продаже на Сайте.
            </p>
            <p className={styles.paragraph}>
              <strong>1.9.</strong> Заказ — оформленный запрос Покупателя на приобретение Товара и его
              передачу в электронной форме (на e-mail и/или в личный кабинет на Сайте).
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Общие положения</h2>
            <p className={styles.paragraph}>
              <strong>2.1.</strong> Продавец осуществляет продажу Товаров через Интернет-магазин по
              адресу{' '}
              <a href="https://www.helpersew.com" className={styles.link}>https://www.helpersew.com</a>.
            </p>
            <p className={styles.paragraph}>
              <strong>2.2.</strong> Информация о Товарах на Сайте является неотъемлемой частью настоящей
              оферты.
            </p>
            <p className={styles.paragraph}>
              <strong>2.3.</strong> Продавец вправе менять условия оферты в одностороннем порядке. Новая
              редакция действует с момента публикации на Сайте; к уже заключённым договорам применяется
              редакция на момент акцепта.
            </p>
            <p className={styles.paragraph}>
              <strong>2.4.</strong> Акцепт оферты — оплата Заказа. Договор розничной купли-продажи
              цифрового товара считается заключённым с момента зачисления оплаты и предоставления доступа
              к Товару (направления файлов на e-mail и/или размещения в личном кабинете).
            </p>
            <p className={styles.paragraph}>
              <strong>2.5.</strong> Сообщая e-mail и телефон, Пользователь соглашается на информирование
              по Заказу (статус, доступ, вопросы исполнения). Рекламные рассылки направляются только при
              отдельном согласии, которое можно отозвать в любой момент.
            </p>
            <p className={styles.paragraph}>
              <strong>2.6.</strong> Продавец может поручить исполнение договора третьим лицам, оставаясь
              ответственным перед Покупателем.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Предмет соглашения</h2>
            <p className={styles.paragraph}>
              <strong>3.1.</strong> Продавец предоставляет Пользователю возможность приобретать для
              личных, семейных, домашних и иных нужд Товары, представленные в каталоге интернет-магазина.
            </p>
            <p className={styles.paragraph}>
              <strong>3.2.</strong> Настоящая оферта распространяется на все Товары и услуги, пока их
              предложения размещены в каталоге.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Регистрация и данные</h2>
            <p className={styles.paragraph}>
              <strong>4.1.</strong> Заказы можно оформлять без обязательной предварительной регистрации.
            </p>
            <p className={styles.paragraph}>
              <strong>4.2.</strong> Пользователь отвечает за корректность предоставленных данных
              (e-mail, ФИО и пр.); некорректные данные могут привести к невозможности исполнения.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Товар и порядок покупки</h2>
            <p className={styles.paragraph}>
              <strong>5.1.</strong> Информация о Товарах регулярно обновляется. Фотографии носят
              иллюстративный характер и могут незначительно отличаться от фактического вида, что не
              является основанием для претензий, если не влияет на потребительские свойства.
              Описания/характеристики могут содержать опечатки.
            </p>
            <p className={styles.paragraph}>
              <strong>5.2.</strong> Цена Товара указывается на Сайте и, если прямо не указано иное,
              указывает стоимость 1 размера выкройки.
            </p>
            <p className={styles.paragraph}>
              <strong>5.3.</strong> Процедура оформления Заказа описана на странице «Как купить»:{' '}
              <a href="https://helpersew.com/usloviya-zakaza/" className={styles.link}>
                https://helpersew.com/usloviya-zakaza/
              </a>
            </p>
            <p className={styles.paragraph}>
              <strong>5.4.</strong> При невозможности исполнить Заказ Продавец вправе исключить Товар из
              Заказа/аннулировать Заказ с уведомлением на e-mail; предоплата за аннулированные позиции
              возвращается тем же способом.
            </p>
            <p className={styles.paragraph}>
              <strong>5.5.</strong> Как правило, доступ/файлы предоставляются в течение 3 минут после
              оплаты; фактическое время может отличаться по техническим причинам.
            </p>
            <p className={styles.paragraph}>
              <strong>5.6. (Лицензия)</strong> Покупателю предоставляется неисключительная бессрочная
              лицензия на личное использование цифровых выкроек. Запрещены распространение, публикация,
              передача третьим лицам, размещение в публичном доступе и перепродажа файлов/доступа.
            </p>
            <p className={styles.paragraph}>
              <strong>5.7. (Замена размера)</strong> Замена размера цифрового товара возможна до первого
              скачивания/получения доступа. Факт скачивания/доставки фиксируется системой и подтверждает
              передачу товара надлежащего качества.
            </p>
            <p className={styles.paragraph}>
              <strong>5.8. (Антиабуз)</strong> В целях защиты от злоупотреблений Продавец вправе
              устанавливать разумные технические лимиты на число скачиваний/активных ссылок и одновременных
              сессий; такие лимиты не ограничивают добросовестный доступ Покупателя к приобретённому Товару.
            </p>
            <p className={styles.paragraph}>
              <strong>5.9. (Очевидная опечатка)</strong> Продавец вправе отменить Заказ и вернуть оплату
              в случае очевидной опечатки в цене/характеристике (например, несоразмерно заниженная цена),
              уведомив Покупателя.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Оплата</h2>
            <p className={styles.paragraph}>
              <strong>6.1.</strong> Продажа осуществляется по 100% предоплате, в рублях РФ, онлайн на Сайте.
            </p>
            <p className={styles.paragraph}>
              <strong>6.2.</strong> При некорректной цене на Заказанный Товар Продавец связывается с
              Покупателем для подтверждения по верной цене либо аннулирует Заказ с возвратом оплаченных сумм.
            </p>
            <p className={styles.paragraph}>
              <strong>6.3.</strong> Авторизация и проведение операций по банковским картам осуществляются
              банком-эмитентом в соответствии с действующим законодательством и правилами платёжных систем.
              Продавец может запросить документ, удостоверяющий личность, для проверки правомерности операции.
            </p>
            <p className={styles.paragraph}>
              <strong>6.4.</strong> Продавец вправе предоставлять скидки и бонусы; виды, порядок и условия
              их применения определяются Продавцом и публикуются на Сайте.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Доставка (передача цифрового товара)</h2>
            <p className={styles.paragraph}>
              <strong>7.1.</strong> Передача цифрового Товара осуществляется путём направления файлов на
              e-mail Покупателя и/или размещения в его личном кабинете на Сайте.
            </p>
            <p className={styles.paragraph}>
              <strong>7.2.</strong> Обязанность Продавца по передаче цифрового Товара считается
              исполненной в момент предоставления доступа/направления файлов.
            </p>
            <p className={styles.paragraph}>
              <strong>7.3.</strong> При проблемах с доставкой письма (спам-фильтры и пр.) Товар доступен
              в личном кабинете; служба поддержки помогает с восстановлением доступа.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Гарантии и возврат</h2>
            <p className={styles.paragraph}>
              <strong>8.1.</strong> Условия возврата/обмена опубликованы:{' '}
              <a href="https://helpersew.com/vozvrat-i-obmen/" className={styles.link}>
                https://helpersew.com/vozvrat-i-obmen/
              </a>
            </p>
            <p className={styles.paragraph}>
              <strong>8.2.</strong> В отношении цифрового контента: после предоставления доступа/первого
              скачивания возврат не производится, за исключением случаев дефектов или несоответствия
              описанию — в пределах, установленных Законом РФ «О защите прав потребителей».
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Конфиденциальность и персональные данные</h2>
            <p className={styles.paragraph}>
              <strong>9.1.</strong> Политика конфиденциальности размещена по адресу:{' '}
              <a href="/legal/privacy" className={styles.link}>
                https://helpersew.com/politika-konfidetsialnosti/
              </a>
            </p>
            <p className={styles.paragraph}>
              <strong>9.2.</strong> Предоставляя персональные данные (имя/ФИО, e-mail, телефон),
              Покупатель даёт согласие на их обработку в целях регистрации/идентификации на Сайте,
              клиентской поддержки, исполнения Заказа, информирования о статусе и доставке, а также
              ведения бухгалтерского/налогового учёта — на основании ФЗ № 152-ФЗ «О персональных данных».
            </p>
            <p className={styles.paragraph}>
              <strong>9.3.</strong> Персональные данные хранятся в течение сроков, необходимых для
              исполнения договора и требований законодательства, после чего подлежат
              удалению/обезличиванию, если более длительное хранение не требуется по закону.
            </p>
            <p className={styles.paragraph}>
              <strong>9.4.</strong> Передача третьим лицам допускается, когда это необходимо для
              исполнения договора (платёжные и почтовые операторы и пр.), а также по законным запросам
              уполномоченных органов. Объём передаваемых данных ограничивается необходимым минимумом.
            </p>
            <p className={styles.paragraph}>
              <strong>9.5.</strong> Рассылки рекламного характера направляются только при наличии
              отдельного согласия; согласие может быть отозвано в любой момент.
            </p>
            <p className={styles.paragraph}>
              <strong>9.6.</strong> Запрос на получение копии, уточнение, ограничение обработки или
              удаление персональных данных можно направить на{' '}
              <a href="mailto:helpersew@gmail.com" className={styles.link}>helpersew@gmail.com</a>;
              запрос будет обработан в разумный срок в пределах, установленных законом.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Срок действия оферты</h2>
            <p className={styles.paragraph}>
              <strong>10.1.</strong> Оферта действует с момента размещения на Сайте до её отзыва Продавцом.
            </p>
            <p className={styles.paragraph}>
              <strong>10.2.</strong> К заключённым договорам применяется редакция оферты, действовавшая
              на момент акцепта Покупателем.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Дополнительные условия</h2>
            <p className={styles.paragraph}>
              <strong>11.1.</strong> Продавец вправе уступать права и переводить обязанности по настоящему
              Соглашению третьим лицам без согласия Покупателя при условии соблюдения закона и сохранения
              прав Покупателя.
            </p>
            <p className={styles.paragraph}>
              <strong>11.2.</strong> Интернет-магазин и сервисы могут быть временно недоступны по
              техническим причинам; Продавец стремится минимизировать перерывы.
            </p>
            <p className={styles.paragraph}>
              <strong>11.3.</strong> К отношениям сторон применяется законодательство Российской Федерации.
            </p>
            <p className={styles.paragraph}>
              <strong>11.4.</strong> Недействительность отдельного положения не влечёт недействительность
              остальной части оферты.
            </p>
            <p className={styles.paragraph}>
              <strong>11.5.</strong> Контакты службы поддержки:{' '}
              <a href="mailto:patterns@helpersew.com" className={styles.link}>patterns@helpersew.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

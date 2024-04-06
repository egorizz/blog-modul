import React, { useContext, useEffect, useState } from 'react';
import format from 'date-fns/format';
import Markdown from 'react-markdown';
import { withRouter } from 'react-router-dom';

import ServiceContext from '../../context';
import ROUTER_PATHS from '../../Paths/Paths';

import styles from './article.module.css';

const Article = ({ itemId, history, auth, curUser, showMessage }) => {
  const [article, setArticle] = useState({});
  const [currentUser, setCurUser] = useState('');
  const [deleteOk, setDeleteOk] = useState(false);
  const [likedFlag, setLikedFlag] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  /* eslint-disable-next-line */
  const [likedList, setLikedList] = useState([]);

  const testService = useContext(ServiceContext);
  useEffect(() => {
    testService
      .getArticle(itemId)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setArticle(res.article);
      })
      .catch((err) => {
        showMessage(err.message);
      });

    if (!localStorage.getItem('liked_list')) {
      localStorage.setItem('liked_list', JSON.stringify([]));
    } else {
      const list = localStorage.getItem('liked_list');
      setLikedList(JSON.parse(list));
    }
  }, []);
  useEffect(() => {
    setLikedFlag(article.favorited);
    setLikeCount(article.favoritesCount);
  }, [article]);

  useEffect(() => {
    if (curUser.user) {
      setCurUser(curUser.user.username);
    }
  }, [curUser]);

  let imageUrl;
  let author = 'no author';
  let date = 'no date';
  if (article.updatedAt) {
    const x = new Date(article.updatedAt);
    date = format(x, 'MMMMMM dd, yyyy');
  }

  author = article?.author?.username;

  if (article.author) {
    imageUrl = article.author.image;
  }

  const Tag = ({ value }) => {
    return <div className={styles.article__tag}>{value}</div>;
  };

  const deleteHandler = () => {
    setDeleteOk(true);
  };

  const editHandler = () => {
    history.push(`${ROUTER_PATHS.ARTICLES}/${itemId}/edit`);
  };

  const confirmationHandler = () => {
    testService
      .deleteArticle(itemId)
      .then((res) => res.json())

      .catch(() => {
        showMessage('Статья удалена!');
        setTimeout(() => {
          history.push(ROUTER_PATHS.ARTICLES);
        }, 1000);
      });
    setDeleteOk(false);
  };

  const cancelHandler = () => {
    setDeleteOk(false);
  };

  const addToFavorites = () => {
    if (auth.auth) {
      if (!likedFlag) {
        testService
          .toFavorites(itemId)
          .then((res) => res.json())
          .then(() => {
            setLikedFlag(true);
            setLikeCount(() => likeCount + 1);
            const curList = JSON.parse(localStorage.getItem('liked_list'));
            curList.push(itemId);
            localStorage.setItem('liked_list', JSON.stringify(curList));
            showMessage('Добавлено в избранное!');
          })
          .catch((err) => {
            showMessage(`Ошибка запроса! ${err.message}`);
          });
      } else {
        testService
          .unFavorites(itemId)
          .then((res) => res.json(res))
          .then(() => {
            setLikedFlag(false);
            setLikeCount(() => likeCount - 1);
            const curList = JSON.parse(localStorage.getItem('liked_list'));
            const newList = [...curList].filter((node) => node !== itemId);
            localStorage.setItem('liked_list', JSON.stringify(newList));
            showMessage('Удалено из избранного!');
          })
          .catch(() => {
            showMessage('Ошибка при попытке подписаться!');
          });
      }
    } else {
      showMessage('Вам необходимо авторизоваться!');
      history.push(ROUTER_PATHS.SIGN_IN);
    }
  };

  return (
    <div className={styles.article}>
      <div className={styles.article__headWrapper}>
        <div className={styles.article__left}>
          <div className={styles.article__title}>
            <span className={styles.article__titleBox}>{article.title}</span>

            <div className={likedFlag ? styles.article__liked : styles.article__like} onClick={addToFavorites}></div>
            <div className={styles.article__count}>{likeCount}</div>
          </div>
          <div className={styles.article__tags}>
            {article.tagList?.map((value) => (
              <Tag value={value} key={Math.random()} />
            ))}
          </div>
          <div className={styles.article__description}>{article.description}</div>
        </div>
        <div className={styles.article__right}>
          <div className={styles.article__profileCard}>
            <div className={styles.article__info}>
              <div className={styles.article__name}>{author}</div>
              <div className={styles.article__date}>{date}</div>
            </div>
            <div
              className={styles.article__cardIcon}
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: '50% 50%',
                backgroundSize: '105%',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
          </div>
          {auth.auth && currentUser === author ? (
            <div className={styles.article__buttonWrapper}>
              <div className={styles.article__dialog} style={deleteOk ? { display: 'block' } : { display: 'none' }}>
                <div className={styles.article__dialogInside}>
                  <div className={styles.article__dialogAngle}></div>
                  <div className={styles.article__circle}></div>
                  <div className={styles.article__question}>Are you sure to delete this article?</div>
                  <div className={styles.article__buttons}>
                    <button className={styles.article__buttonNo} onClick={cancelHandler}>
                      No
                    </button>
                    <button className={styles.article__buttonYes} onClick={confirmationHandler}>
                      Yes
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.article__deleteButton} onClick={deleteHandler}>
                Delete
              </div>
              <div className={styles.article__editButton} onClick={editHandler}>
                Edit
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.article__body}>
        <Markdown>{article.body}</Markdown>
      </div>
    </div>
  );
};

export default withRouter(Article);

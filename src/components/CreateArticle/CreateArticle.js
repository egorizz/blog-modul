import React, { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { withRouter } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';

import ServiceContext from '../../context';
import { CreateArticleSchema } from '../../YUP';
import ROUTER_PATHS from '../../Paths/Paths';

import styles from './createArticle.module.css';

const CreateArticle = ({ history, showMessage, isNew, slug, auth }) => {
  const [tags, setTags] = useState([]);
  const [curTag, setCurTag] = useState('');
  const testService = useContext(ServiceContext);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    if (!isNew) {
      testService
        .getArticle(slug)
        .then((res) => res.json())
        .then((res) => setArticle(res.article))
        .catch((err) => {
          showMessage(`Ошибка ! ${err.message}`);
        });
    }
  }, []);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(CreateArticleSchema),
  });

  const onSubmit = (data) => {
    const sendedTags = [];
    tags.forEach((tag) => sendedTags.push(tag.value));

    const dataWithTags = { ...data, tagList: sendedTags };
    if (isNew) {
      testService
        .createArticle(dataWithTags)
        .then((res) => {
          return res.json();
        })
        .then(() => {
          showMessage('Статья успешно добавлена!');
          history.push(ROUTER_PATHS.ARTICLES);
        })
        .catch(() => {
          showMessage('Ошибка при выполнении запроса!');
        });
    } else {
      testService
        .editArticle(slug, dataWithTags)
        .then((res) => {
          return res.json();
        })
        .then(() => {
          showMessage('Статья отредактирована!');
          reset();
          setTags([]);

          history.push(ROUTER_PATHS.ARTICLES);
        })
        .catch((err) => {
          showMessage(`Ошибка при отправке! ${err.message}`);
        });
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    if (curTag.length) {
      setTags([{ value: curTag, id: Date.now() }, ...tags]);
      setCurTag('');
    }
  };

  const deleteTagHandler = (e) => {
    e.preventDefault();
    const newTags = [...tags].filter((tag) => String(tag.id) !== e.target.id);
    setTags(newTags);
  };

  useEffect(() => {
    if (article && !isNew) {
      const receivedTags = [];
      article.tagList?.forEach((tag) => {
        receivedTags.push({ id: Math.random() * Date.now(), value: tag });
      });
      reset({
        title: article.title,
        description: article.description,
        body: article.body,
      });
      setTags(receivedTags);
    }
  }, [article]);

  if (auth.auth) {
    return (
      <div className={styles.createArticle}>
        <form className={styles.createArticle__form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.createArticle__title}>{isNew ? 'Create new article' : 'Edit article'}</div>
          <div className={styles.createArticle__label}>
            <div className={styles.createArticle__description}>Title</div>

            <input className={styles.createArticle__input} {...register('title')} />

            <br />
            <span className={styles.createArticle__warning}>{errors?.title && <p>{errors?.title?.message}</p>}</span>
          </div>
          <div className={styles.createArticle__label}>
            <div className={styles.createArticle__description}>Short description</div>

            <input className={styles.createArticle__input} {...register('description')} />
            <br />
            <span className={styles.createArticle__warning}>
              {errors?.description && <p>{errors?.description?.message}</p>}
            </span>
          </div>

          <div className={styles.createArticle__label}>
            <div className={styles.createArticle__description}>Text</div>

            <textarea className={styles.createArticle__area} width="874px" type="text" {...register('body')} />
            <br />
            <span className={styles.createArticle__warning}>{errors?.body && <p>{errors?.body?.message}</p>}</span>
          </div>

          <div className={styles.createArticle__description}>Tags</div>
          <div>
            {tags.map((tag) => (
              <div key={tag.id} className={styles.createArticle__tagWrapper}>
                <input className={styles.createArticle__tagInput} value={tag.value} readOnly />
                <button id={tag.id} className={styles.deleteButton} onClick={(e) => deleteTagHandler(e)}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className={styles.createArticle__tagWrapper}>
            <input
              value={curTag}
              className={styles.createArticle__tagInput}
              onChange={(e) => setCurTag(e.target.value)}
            />
            <button className={styles.addTagButton} onClick={(e) => addTag(e)}>
              Add tag
            </button>
          </div>

          <button type="submit" className={styles.sendButton}>
            Send
          </button>
        </form>
      </div>
    );
  }
  return <h1 style={{ marginLeft: '200px' }}>Это приватная страница! Вам необходимо авторизоваться.</h1>;
};

export default withRouter(CreateArticle);

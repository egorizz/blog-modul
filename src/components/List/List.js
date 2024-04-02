import React, { useContext, useEffect, useState } from 'react';
import { Pagination } from 'antd';
import { withRouter } from 'react-router-dom';

import ServiceContext from '../../context';
import ArticleItem from '../ArticleItem';

import styles from './list.module.css';

const List = ({ history }) => {
  const [articles, setArticles] = useState([1, 3, 4]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  /* eslint-disable-next-line */
  const [error, setError] = useState('');
  const testService = useContext(ServiceContext);

  const dataReceiver = (data) => {
    setArticles(data.articles);
    setTotalPages(Math.ceil(data.articlesCount / 5));
  };

  useEffect(() => {
    testService.getArticles(
      (res) => dataReceiver(res),
      (err) => setError(err),
      5,
      (currentPage - 1) * 5
    );
  }, [currentPage]);

  return (
    <div className={styles.list}>
      {articles.map((article) => (
        <ArticleItem
          article={article}
          key={Math.random() * Date.now()}
          onItemSelected={(slug) => {
            history.push(`/articles/${slug}`);
          }}
        />
      ))}
      <div className={styles.list__pagination}>
        <Pagination
          defaultCurrent={0}
          pageSize={1}
          total={totalPages}
          showSizeChanger={false}
          onChange={(page) => setCurrentPage(page)}
          style={{ display: 'inline-block' }}
        />
      </div>
    </div>
  );
};

export default withRouter(List);

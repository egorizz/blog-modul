import { Spin, Pagination } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { withRouter, useLocation } from 'react-router-dom';
import queryString from 'query-string';

import ROUTER_PATHS from '../../Paths/Paths';
import ArticleItem from '../ArticleItem';
import ServiceContext from '../../context';

import styles from './list.module.css';

const List = ({ history }) => {
  const testService = useContext(ServiceContext);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(() => {
    const queryParams = queryString.parse(location.search);
    return queryParams.page ?? 1;
  });

  const dataReceiver = (data) => {
    setArticles(data.articles);
    setTotalPages(Math.ceil(data.articlesCount / 5));
  };

  useEffect(() => {
    const searchParams = new URLSearchParams();
    searchParams.append('page', currentPage);
    history.push(`${ROUTER_PATHS.ARTICLES}/?${searchParams.toString()}`);

    setIsLoading(true);
    testService
      .getArticles(5, (currentPage - 1) * 5)
      .then((res) => res.json())
      .then((res) => {
        setIsLoading(false);
        dataReceiver(res);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [currentPage]);

  const articlesList = articles.map((article) => (
    <ArticleItem
      article={article}
      key={Math.random()}
      onItemSelected={(slug) => {
        history.push(`${ROUTER_PATHS.ARTICLES}/${slug}`);
      }}
    />
  ));

  return (
    <div className={styles.list}>
      {isLoading ? <Spin size="large" /> : null}
      {articlesList}

      <div className={styles.list__pagination}>
        <Pagination
          defaultCurrent={currentPage}
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

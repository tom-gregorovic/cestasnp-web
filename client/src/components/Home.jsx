import React, { useContext, useEffect, useState } from 'react';
import ActiveLight from './ActiveLight';
import { fetchJson } from '../helpers/fetchUtils';
import DivWithLoader from './reusable/DivWithLoader';
import { A } from './reusable/Navigate';
import ButtonReadMore from './reusable/ButtonReadMore';
import { LocalSettingsContext } from './LocalSettingsContext';

const Home = (props) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    Promise.all([fetchJson('/api/articles/for/home'), fetchJson('/api/articles/article/60')])
      .then(([data, article]) => {
        setArticles(article.concat(data));
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
      });
  }, []);

  const settingsData = useContext(LocalSettingsContext);

  const month = (new Date()).getMonth + 1;

  const getArticleImage = (intro) => {
      const res = intro && intro.match(/["'](https:\/\/res.cloudinary.com\/.*?)["']/);
      return res && res.length > 1 ? res[1] : null;
    };

  return (
    <div id="Home">
      <div className="home-articles-and-box">
        <div className="active-travellers-box">            
          <A
            href={settingsData.activeLink.href}
            className="no-decoration"
          >
            <h3 className="no-decoration">Info z cesty</h3>
          </A>     
          
          <ActiveLight box />
        </div>

        <DivWithLoader className="home-articles" loading={loading}>
          <div className="home-intro">
            <div className="home-intro-text">najdlhšia pešia trasa na Slovensku je zážitok na celý život</div>
            <ButtonReadMore white href="/pred/articles/article/60"/>
          </div>
        
          {articles && articles.map((article, i) => { 
            const imgUrl = getArticleImage(article.introtext);

            return (
                  <div id={`home${i + 1}`} key={i}>
                    <div className="article-div">
                      {!!imgUrl && <div className="article-image before" style={{ backgroundImage: `url("${imgUrl}")` }}/>}
                      
                      <A
                        className="no-decoration"
                        href={`/pred/articles/article/${article.sql_article_id}`}
                      >
                        <h2 className="no-decoration">{article.title}</h2>
                      </A>

                      {!!imgUrl && <div className="article-image" style={{ backgroundImage: `url("${imgUrl}")` }}/>}
                      <div className="article-text-col">
                        <div className="article-text">{article.introtext.replaceAll(/<[^>]+>/g, '')}</div>
                        <ButtonReadMore href={`/pred/articles/article/${article.sql_article_id}`} />
                      </div>
                    </div>
                  </div>);
              })}
        </DivWithLoader>
      </div>

      <div className="home banner">
        { (month >= 5 && mont <= 10)
          ? <A href={settingsData.activeLink.href}>LIVE sledovanie</A>
          : <A href="/pred/pois">Dôležité miesta</A>}
      </div>
    </div>
  );
}

export default Home;

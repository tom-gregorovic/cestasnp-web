import React, { useContext, useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import NavRouterItem from './reusable/NavRouterItem'
import logo from '../../public/img/logo.svg';
import { AuthContext } from './AuthContext';
import { A } from './reusable/Navigate';
import { LocalSettingsContext } from './LocalSettingsContext';
import auth from '../helpers/firebase';
import { fetchPostJsonWithToken } from '../helpers/fetchUtils';
import * as Constants from './Constants';
import { sortByDate } from '../helpers/helpers';

const ROUTES = {
  domov: '/',
  predCestou: '/pred',
  clanky: '/pred/articles/1',
  pois: '/pred/pois',
  itinerary: '/pred/itinerar',
  naCeste: '/na/ceste',
  archiv: '/na/archive',
  kontakt: '/kontakt',
  mojaCesta: '/ucet',
  poslatSpravu: '/ucet/poslatspravu',
  pridatPOI: '/ucet/pridatpoi',
  pridatClanok: '/ucet/pridatclanok',
  ucetPois: '/ucet/pois',
  zmeny: '/ucet/zmeny'
};

const Navigation = () => {
  const [newComments, setNewComments] = useState([]);

  const authData = useContext(AuthContext);
  const settingsData = useContext(LocalSettingsContext);
  const isTraveler = authData.travellerDetails &&
    Object.keys(authData.travellerDetails).length > 0;

  const checkNewComments = () => {
    fetchPostJsonWithToken(authData.user, '/api/traveller/newComments', {  
      uid: authData.userDetails.uid,
      detailsId: authData.travellerDetails._id, 
      articleId: authData.travellerDetails.articleID, 
      date: authData.travellerDetails.lastViewed || Constants.NewCommentsNotificationAfter
    })
    .then(data => {
      sortByDate(data, a => a.date, true);  
      setNewComments(data);
    })
    .catch(err => console.error(err));
  }

  useEffect(() => {
    if (isTraveler) {
      checkNewComments();
      const interval = setInterval(checkNewComments, Constants.NewCommentsNotificationPeriod);

      return () => clearInterval(interval);
    } else {
      setNewComments([]);
    }
  }, [isTraveler, authData.travellerDetails.lastViewed]);

  const hasNewCommentsText = newComments && newComments.length > 0 ?
    `nový komentár od ${newComments[0].name}` : "";

  return (
    <Navbar inverse collapseOnSelect>
      <Navbar.Header>
        <Navbar.Brand>
          <A href={ROUTES.domov}>
            <div
              title="Domov"
              className="logo-position-mobile"
            >
              <img
                src={logo}
                className="logo-mobile"
                alt="Cesta SNP logo pre mobil"
              />
            </div>
            <div
              title="Domov"
              className="logo-position-screen"
            >
              <img
                src={logo}
                className="logo-screen"
                alt="Cesta SNP logo pre obrazovku"
              />
            </div>
          </A>
        </Navbar.Brand>
        <Navbar.Toggle className={hasNewCommentsText ? 'has-badge' : ''}/>
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight className={!authData.isAuth ? "not-auth" : "auth"}>
          {!authData.isAuth && (
          <NavRouterItem
            href={ROUTES.ucetPois}
            eventKey={0}
            className="red-button mobile"
          >
            Prihlásiť sa             
          </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href="#"
              className="mobile account-name"
            >
              {authData.userDetails.email}
            </NavRouterItem>)}

            {!!authData.isAuth && !!hasNewCommentsText && (
            <NavRouterItem
              href={`/na/${authData.userDetails.uid}#${newComments[0]._id}`}
              eventKey={100}
              title={hasNewCommentsText}
              className="mobile new-comments"
            >
              {hasNewCommentsText}
            </NavRouterItem>)}

          {!!authData.isAuth && !isTraveler && (
            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={1}
              title="Založiť LIVE Sledovanie"
              className="mobile"
            >
              Založiť LIVE Sledovanie
            </NavRouterItem>)}

          {!!authData.isAuth && isTraveler && (
            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={1}
              title="Moja cesta"
              className="mobile"
            >
              Moja cesta
            </NavRouterItem>)}

          {!!authData.isAuth && isTraveler && (
            <NavRouterItem
              href={ROUTES.poslatSpravu}
              eventKey={2}
              title="Poslať správu"
              className="mobile"
            >
              Poslať správu
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href={ROUTES.pridatPOI}
              eventKey={3}
              title="Pridať dôležité miesto"
              className="mobile"
            >
              Pridať dôležité miesto             
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href={ROUTES.pridatClanok}
              eventKey={4}
              title="Pridať článok"
              className="mobile"
            >
              Pridať článok           
            </NavRouterItem>)}

          {!!authData.isAuth && !!authData.userDetails && authData.userDetails.articlesRole == 'admin' && (
            <NavRouterItem
              href={ROUTES.zmeny}
              eventKey={5}
              title="Prehľad zmien"
              className="mobile"
            >
              Prehľad zmien           
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href="#"
              eventKey={6}
              title="Odhlásiť"
              onClick={() => auth.signOut()}
              className="mobile"
            >
              Odhlásiť             
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href="#"
              className="line-divider mobile"
            >           
              <hr/>
            </NavRouterItem>)}

          <NavRouterItem
            href={ROUTES.clanky}
            eventKey={11}
            title="Články"
          >
            Pred cestou
          </NavRouterItem>

          <NavRouterItem
            href={ROUTES.pois}
            eventKey={12}
            title="Dôležité miesta"
          >
            Mapa
          </NavRouterItem>

          <NavRouterItem
            href={settingsData.activeLink.href}
            eventKey={13}
            title="LIVE sledovanie"
          >
            LIVE sledovanie
          </NavRouterItem>

          <NavRouterItem
            href={ROUTES.archiv}
            eventKey={15}
            title="Archív"
          >
            Archív
          </NavRouterItem>

          {!authData.isAuth && (
          <NavRouterItem
            href={ROUTES.ucetPois}
            eventKey={16}
            className="red-button desktop"
          >
            Prihlásiť sa             
          </NavRouterItem>)}

          {!!authData.isAuth && (
          <NavDropdown eventKey={17} title="Môj účet" id="basic-nav-dropdown" className={"desktop" + (hasNewCommentsText ? ' has-badge' : '')}>
            <NavRouterItem
              href="#"
              className="desktop account-name"
            >
              {authData.userDetails.email}
            </NavRouterItem>

          {!!authData.isAuth && !!hasNewCommentsText && (
            <NavRouterItem
              href={`/na/${authData.userDetails.uid}#${newComments[0]._id}`}
              eventKey={200}
              title={hasNewCommentsText}
              className="desktop new-comments"
            >
              {hasNewCommentsText}
            </NavRouterItem>)}

          {!isTraveler && (
            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={20}
              title="Založiť LIVE Sledovanie"
              className="desktop"
            >
              Založiť LIVE Sledovanie
            </NavRouterItem>)}

          {isTraveler && (
            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={20}
              title="Moja cesta"
              className="desktop"
            >
              Moja cesta
            </NavRouterItem>)}

          {isTraveler && (
            <NavRouterItem
              href={ROUTES.poslatSpravu}
              eventKey={21}
              title="Poslať správu z cesty"
              className="desktop"
            >
              Poslať správu z cesty
            </NavRouterItem>)}          

            <NavRouterItem
              href={ROUTES.pridatPOI}
              eventKey={22}
              title="Pridať dôležité miesto"
              className="desktop"
            >
              Pridať dôležité miesto             
            </NavRouterItem>

            <NavRouterItem
              href={ROUTES.pridatClanok}
              eventKey={23}
              title="Pridať článok"
              className="desktop"
            >
              Pridať článok           
            </NavRouterItem>

            {!!authData.userDetails && authData.userDetails.articlesRole == 'admin' && <NavRouterItem
              href={ROUTES.zmeny}
              eventKey={24}
              title="Prehľad zmien"
              className="desktop"
            >
              Prehľad zmien           
            </NavRouterItem>}

            <NavRouterItem
              href="#"
              eventKey={25}
              title="Odhlásiť"
              onClick={() => auth.signOut()}
              className="desktop"
            >
              Odhlásiť             
            </NavRouterItem>
          </NavDropdown>)}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;

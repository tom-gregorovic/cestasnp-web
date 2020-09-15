import React, { useContext } from 'react';
import { Navbar, Nav, NavDropdown, NavItem, MenuItem } from 'react-bootstrap';
import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap'
import logo_screen from '../../public/img/logo_screen.png';
import logo_mobile from '../../public/img/logo_mobile.png';
import { AuthContext } from './AuthContext';

const ROUTES = {
  domov: '/',
  predCestou: '/pred',
  clanky: '/pred/articles/1',
  pois: '/pred/pois',
  naCeste: '/na/ceste',
  archiv: '/na/archive',
  kontakt: '/kontakt',
  mojaCesta: '/ucet'
};

const Navigation = () => {
  const authData = useContext(AuthContext);
  return (
    <Navbar inverse collapseOnSelect>
      <Navbar.Header>
        <Navbar.Brand>
        <IndexLinkContainer to={ROUTES.domov}>
          <div
            title="Domov"
            className="logo-position-mobile"
          >
            <img
              src={logo_mobile}
              className="logo-mobile"
              alt="Cesta SNP logo pre mobil"
            />
          </div>
          </IndexLinkContainer>
          <IndexLinkContainer to={ROUTES.domov}>
          <div
            title="Domov"
            className="logo-position-screen"
          >
            <img
              src={logo_screen}
              className="logo-screen"
              alt="Cesta SNP logo pre obrazovku"
            />
          </div></IndexLinkContainer>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
        <IndexLinkContainer to={ROUTES.domov}>
          <NavItem
            eventKey={1}
            title="Domov"
          >
            Domov
          </NavItem></IndexLinkContainer>

          <NavDropdown eventKey={2} title="Pred cestou" id="basic-nav-dropdown">
          <LinkContainer to={ROUTES.clanky}>
            <NavItem
              eventKey={2.1}
              title="Články"
            >
              Články
            </NavItem></LinkContainer>
            <LinkContainer to={ROUTES.pois}>
            <NavItem
              eventKey={2.2}
              title="Dôležité miesta"
            >
              Dôležité miesta
            </NavItem></LinkContainer>
          </NavDropdown>

<LinkContainer to={ROUTES.naCeste}>
          <MenuItem
            eventKey={3}
            title="LIVE sledovanie"
          >
            LIVE sledovanie
          </MenuItem></LinkContainer>

          <LinkContainer to={ROUTES.archiv}>
          <NavItem as={LinkContainer}
            eventKey={5}
            title="Archív"
          >
            Archív
          </NavItem></LinkContainer>

          <LinkContainer to={ROUTES.kontakt}>
          <NavItem
            eventKey={6}
            title="Kontakt"
          >
            Kontakt
          </NavItem></LinkContainer>

<LinkContainer to={ROUTES.mojaCesta}>
          <NavItem
            eventKey={4}
            title="Moja cesta"
          >
            {!authData.isAuth ? 'Prihlásiť sa' : 'Poslať správu'}
          </NavItem></LinkContainer>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;

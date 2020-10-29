import React, { useEffect, useState } from 'react';
import DivWithLoader from './DivWithLoader';
import FormItem from './FormItem';
import * as Constants from '../Constants';
import { parseGPSPos } from '../../helpers/GPSPosParser';

const FormLatLon = (props) => {
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (edit != props.edit) {
      setEdit(props.edit);
    }
  }, [props.edit]);

  const getMyPosition = () => {

    setLoading(true);
    (props.onError || (() => {}))('');

    const options = {
      timeout: 8000,
      enableHighAccuracy: true
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLoading(false);

        var lat = coords.latitude.toFixed(6);
        var lon = coords.longitude.toFixed(6);

        if (coords.accuracy > Constants.MaxAllowedGPSAccuracy) {
          console.error('low GPS accuracy ', coords.accuracy);

          (props.onError || (() => {}))(
              <span>
                Nedostatočná presnosť súradnic. Prosím načítaj pozíciu ešte raz.
                Skontroluj si nastavenie presnosti lokalizačných služieb v nastavení telefónu. 
                Taktiež je možné že nemáš priamy výhľad na oblohu pre správne fungovanie GPS. 
                <br/>Prípadne súradnice zadaj ručne.               
              </span>
            );
        } else {
          setEdit(false);
          (props.onChange || (() => {}))({ latlon: lat + ", " + lon,
            accuracy: coords.accuracy });
        }
      },
      err => {
        setLoading(false);
        console.error('err ', err.message);

        (props.onError || (() => {}))(
            <span>
              Vyzerá to, že nemáš povelené získavanie GPS pozície. Povoľ podľa
              návodu{' '}
              <a
                href="https://cestasnp.sk/pred/articles/article/10004"
                target="_blank"
              >
                tu
              </a>{' '}
              alebo zadaj ručne.
            </span>
          );
      },
      options
    );
  }

  const verifyGPSFormat = ({ target }) => {
    const { value } = target;

    if (value === '') {
      return;
    }

    if (!parseGPSPos(value)) {
      (props.onError || (() => {}))('GPS súradnica má nesprávny formát.');
      return;
    }
  }

  return (    
    <DivWithLoader loading={loading}>
      <FormItem valueName="latlon" valueLabel="Zem. šírka, dĺžka (latitude, longitude)" 
        value={props.value ? props.value.latlon : ''} useEdit valueClass="travellerP" 
        edit={edit} onEdit={v => { setEdit(v); (props.onEdit || (() => {}))(v) }}>
          <input
              id="latlon"
              name="latlon"
              value={props.value ? props.value.latlon : ''}
              onBlur={e => {
                e.preventDefault();
                verifyGPSFormat(e);
              }}
              onChange={e => (props.onChange || (() => {}))({ latlon: e.target.value, accuracy: 0 })}
            />
      </FormItem>

      <button className="snpBtnWhite" onClick={getMyPosition} type="button">
        Získaj pozíciu
      </button>
    </DivWithLoader>
  )
}
export default FormLatLon;
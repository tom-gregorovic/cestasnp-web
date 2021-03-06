import React, { Component, Fragment } from 'react';
import { fixImageUrl } from '../../helpers/helpers';
import { A } from './Navigate';
import { LazyLoadComponent } from 'react-lazy-load-image-component';

const gap = 15;

class SimpleMasonry extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      images: props.images || [],
      width: props.width,
      targetHeight: props.targetHeight,
    };

    this.container = React.createRef();
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    if (this.container.current) {
      const width = Math.floor(this.container.current.offsetWidth);

      if (this.state.width != width) {
          this.setState({ width });
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  calcImages(images, width, targetHeight) {
    if (!width) {
      return [];
    }

    //console.time("calcImages");

    var rowsMax = null;
    var rowsMaxHeight = -100000;
    for (var r = 1; r <= images.length; r++) {
      for (var layout = 0; layout < 2; layout++) {
        const itemsPerRowMax = Math.min(Math.ceil(images.length / r), r);
        const itemsPerRowMin = Math.max(itemsPerRowMax - 1, 1);

        var rows = [];
        var pos = 0;
        for (var row = 0; row < r; row ++) {
          var itemsPerRow = (row % 2 == 0) ? 
          (layout ? itemsPerRowMin : itemsPerRowMax)
          : (layout ? itemsPerRowMax : itemsPerRowMin);

          if (pos + itemsPerRow + (r - row - 1) > images.length) {
            itemsPerRow = images.length - (r - row - 1) - pos;
          }

          if (row === r - 1) {
            rows.push(images.slice(pos).map((i, p) => { return { aspect: i.aspect, index: pos + p }; }));
          } else {
            rows.push(images.slice(pos, pos + itemsPerRow).map((i, p) => { return { aspect: i.aspect, index: pos + p }; }));
          }
          pos += itemsPerRow;
        }

        var sumHeight = 0;
        rows.forEach(row => {
          
            /*
              h / a1 + gap + h / a2 + gap +... h / an = w

              h = w - gap * (n - 1) * (a1*a2...an) / (a2*a3*...an + a1*a3*...an + ....)
            */

            const mulAspect = row.reduce((r, i) => r * i.aspect, 1);
            const sumAspects = row.reduce((r, i) => r + row.reduce((res, v) => res * (i !== v ? v.aspect : 1), 1), 0);
            const h = Math.max(1, (width - gap * (row.length - 1)) * mulAspect / sumAspects);

            row.forEach(img => { 
              img.width = h / img.aspect; 
              img.height = h; 
            });

            if (sumHeight > 0) {
              sumHeight += gap;
            }
            sumHeight += h;
        });

        var factor = 0; // compute differency of dividings between each two neighbour rows
        for (var i = 1; i < r; i++) {
          const div1 = rows[i - 1].slice(0, rows[i - 1].length - 1)
            .map((t, index, a) => a.slice(0, index + 1).reduce((s, img) => s + img.width, 0)).map(v => Math.round(v / 20));
          const div2 = rows[i].slice(0, rows[i].length - 1)
            .map((t, index, a) => a.slice(0, index + 1).reduce((s, img) => s + img.width, 0)).map(v => Math.round(v / 20));

          const diff = div1
            .filter(x => !div2.includes(x))
            .concat(div2.filter(x => !div1.includes(x)));

          factor += (diff.length / Math.max(1, div1.length + div2.length)) / r;
        }

        const cols = rows.map(r => r.length);
        cols.sort((a, b) => b - a);
        const rowDiff = cols.length >= 2 ? cols[0] - cols[1] : images.length;

        const sumHeightWithFactor = targetHeight +
          (targetHeight / 3) * factor - Math.abs(sumHeight - targetHeight)
          - rowDiff * 100;
        
        /*console.log(rows.map(r => r.length).join(","), 
          "Width", width, "SumHeight", sumHeight, "Factor", factor, "RowDiff", rowDiff, "Total", sumHeightWithFactor);*/

        if (sumHeightWithFactor > rowsMaxHeight) {
          rowsMaxHeight = sumHeightWithFactor;
          rowsMax = rows;
        }
      }

      if (targetHeight - Math.abs(sumHeight - targetHeight) < rowsMaxHeight) {
        break;
      }
    }

    //console.timeEnd("calcImages");

    return rowsMax || rows;
  }

  render() {    
    const imageRows = this.calcImages(this.state.images, this.state.width, this.state.targetHeight);

    return (
      <div className="simple-masonry" ref={this.container}>
        {imageRows.map((row, r) => {
          const innerRow = r < imageRows.length - 1;
          
          const getImage = (img, width, height) => {
            const value = Math.max(width, height);
            return value > 800 ? 
              fixImageUrl(img.src, 'f_auto')
              : value > 400 ?
                fixImageUrl(img.src, 'c_limit,f_auto,w_800,h_800', 'tr=w-800,h-800,c-at_max')
                : value > 240 ?
                fixImageUrl(img.src, 'c_limit,f_auto,w_400,h_400', 'tr=w-400,h-400,c-at_max')
                : fixImageUrl(img.src, 'c_limit,f_auto,w_240,h_240', 'tr=w-240,h-240,c-at_max');
          };

          return (<Fragment key={r}>
            {row.map((item, i) => {
              const img = this.state.images[item.index];

              return (
                <LazyLoadComponent key={i} placeholder={<div
                  className={`simple-masonry-item${innerRow ? ' inner' : ''}`} style={{ hwidth: item.width, height: item.height, maxHeight: this.state.targetHeight }}/>}>
                  <div className={`simple-masonry-item${innerRow ? ' inner' : ''}`} 
                    style={{ width: item.width, height: item.height, maxHeight: this.state.targetHeight }}>
                    <A href={img.url} title={item.width < 100 ? img.title : ""} >
                      <div className="simple-masonry-image" style={{ backgroundImage: "url(" + getImage(img, item.width, item.height) + ")"}}/>
                      {item.width >= 100 && (<div className="simple-masonry-image-title"  style={{ maxWidth: item.width }}>
                        {item.height >= 100 ? img.title : ""}<span><i className="fas fa-external-link-alt"/></span></div>)}
                    </A>
                  </div>
                </LazyLoadComponent>);})}
            {innerRow && (<div className="simple-masonry-br"/>)}           
          </Fragment>)}
          )}
      </div>);
    }
}


export default SimpleMasonry;
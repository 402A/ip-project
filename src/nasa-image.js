import { LitElement, html, css } from 'lit';
import '@lrnwebcomponents/accent-card';

class NasaSearch extends LitElement {
  constructor() {
    super();
    this.NasaImages = [];
    this.term = '';
    this.page = 1;
    this.startYear = 2000;
    this.endYear = 2022;
    this.listView = false;
  }

  static get properties() {
    return {
      term: { type: String, reflect: true },
      page: { type: Number, reflect: true },
      NasaImages: {
        type: Array,
      },
      startYear: { type: Number },
      endYear: { type: Number },
      listView: { type: Boolean, reflect: true, attribute: 'list-view' },
      secondary_creator: { type: String, reflect: true },
    };
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'term' && this[propName]) {
        this.getNasaData();
        /*
      this part does nothing. never call this.render()
    } else if (propName === 'NasaImages') {
       this.render(); */
      } else if (propName === 'NasaImages') {
        this.dispatchEvent(
          new CustomEvent('results-changed', {
            detail: {
              value: this.NasaImages,
            },
          })
        );
      }
    });
  }

  updateTerm(value) {
    this.term = value;
    this.getNasaData();
  }

  async getNasaData() {
    return fetch(
      ` https://images-api.nasa.gov/search?q=${this.term}&page=${this.page}&year_start=${this.startYear}&year_end=${this.endYear}`
    )
      .then(resp => {
        if (resp.ok) {
          return resp.json();
        }
        return false;
      })
      .then(data => {
        this.NasaImages = [];

        data.collection.items.forEach(element => {
          // this generates a JS error because there might not be an array of values here
          // this should be elements && elements.links && element.links[0].href !== undefined
          // while the program still works, some JS environments would stop because of this
          if (element.links[0].href !== undefined) {
            const simplifiedInfo = {
              imagesrc: element.links[0].href,
              title: element.data[0].title,
              description: element.data[0].description,
              secondary_creator: element.data[0].secondary_creator,
            };
            // console.log(simplifiedInfo);
            this.NasaImages.push(simplifiedInfo);
          }
        });
        return data;
      });
  }

  static get styles() {
    return css`
      :host {
        display: block;
        border: 2px solid black;
        min-height: 100px;
      }
      date-card {
        display: inline-flex;
      }
      :host([view='list']) ul {
        margin: 20px;
      }
    `;
  }

  render() {
    return html`${this.listView === true
      ? html`
          <ul>
            ${this.NasaImages.map(
              item => html`
                <li>${item.title}</li>
                <li>${item.imagesrc}</li>
                <li>${item.description}</li>
                <li>${item.secondary_creator}</li>
              `
            )}
          </ul>
        `
      : html` ${this.NasaImages.map(
          item => html` <accent-card image-src="${item.imagesrc}">
            <div slot="heading">${item.title}</div>
            <div slot="content">${item.description}</div>
            <div>${item.secondary_creator}</div>
          </accent-card>`
        )}`}`;
  }
}
customElements.define('nasa-image-search', NasaSearch);

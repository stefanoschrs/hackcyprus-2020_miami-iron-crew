import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { Apollo } from 'apollo-angular'
import gql from 'graphql-tag'
import { Subject } from 'rxjs'
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs/operators'

const GET_LISTINGS = gql`
  query getListings ($pageSize: Int) {
    listings (pageSize: $pageSize) {
      listings {
        id
        title
        address
        category
        meta {
          key
          value
        }
      }
    }
  }
`

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  @ViewChild('listings', { static: false }) listingsEl: ElementRef
  listings: any[]
  filteredListings: any[]

  boxWidth: string

  searchTermModel: string
  private modelChanged: Subject<string> = new Subject<string>()

  introHidden: boolean

  constructor (
    private apollo: Apollo
  ) {
    this.listings = []
    this.searchTermModel = ''

    this.modelChanged
      .pipe(debounceTime(300))
      .pipe(distinctUntilChanged())
      .subscribe((model) => {
        this.filteredListings = this.getFilteredListings()
        this.listingsEl.nativeElement.scroll(0, 0)
      });
  }

  private static calculateWidth () {
    const el = document.querySelector('.listings')
    if (!el) {
      return
    }
    const total = el.clientWidth
    const padding = 40

    let divider = 4
    if (total < 1000) {
      divider = 3
    }
    if (total < 700) {
      divider = 2
    }
    if (total < 400) {
      divider = 1
    }

    return (total / divider) - padding + 'px'
  }

  ngOnInit () {
    this.boxWidth = HomePageComponent.calculateWidth()
    window.onresize = () => {
      this.boxWidth = HomePageComponent.calculateWidth()
    }

    this.apollo
      .query({
        query: GET_LISTINGS,
        variables: {
          pageSize: 10000
        }
      })
      .subscribe((res: any) => {
        this.listings = res.data.listings.listings
        this.filteredListings = this.getFilteredListings()
      })
  }

  searchChanged (text) {
    this.modelChanged.next(text)
  }

  onScroll () {
    setTimeout(() => {
      this.filteredListings.push(...this.getFilteredListings(this.filteredListings.length))
    })
  }

  private getFilteredListings (offset = 0) {
    return this.listings
      .filter((el) => {
        const st = this.searchTermModel.toLowerCase()
        if (el.title.toLowerCase().includes(st)) {
          return true
        }

        if (el.address.toLowerCase().includes(st)) {
          return true
        }

        if (el.category.toLowerCase().includes(st)) {
          return true
        }

        return false
      })
      .slice(offset, offset + 20 > this.listings.length ? this.listings.length : offset + 20)
  }

  private getRest (cursor) {
    this.apollo
      .query({
        query: GET_LISTINGS,
        variables: {
          pageSize: 1000,
          after: cursor
        }
      })
      .subscribe((res: any) => {
        this.listings = [...this.listings, ...res.data.listings.listings]

        if (res.data.hasMore) {
          this.getRest(res.data.cursor)
        }
      })
  }
}

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Socket } from 'ngx-socket-io'
import { ActivatedRoute, Router } from '@angular/router'
import { Apollo } from 'apollo-angular'
import gql from 'graphql-tag'

declare var window: any

const GET_LISTING = gql`
  query getListing ($id: String!) {
    getListing (id: $id) {
      id
      url
      title
      address
      category
      image_url
      meta {
        key
        value
      }
    }
  }
`

@Component({
  selector: 'app-listing-page',
  templateUrl: './listing-page.component.html',
  styleUrls: ['./listing-page.component.scss']
})
export class ListingPageComponent implements OnInit, OnDestroy {
  @ViewChild('messages', { static: false }) messagesEl: ElementRef

  message: string
  listing
  modalVisibility: boolean

  private readonly listingId
  private username
  private checkinCount: number

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private apollo: Apollo,
    private socket: Socket
  ) {
    this.checkinCount = 0
    this.listing = {}
    this.listingId = this.route.snapshot.paramMap.get('id')
    this.username = 'user-' + Math.floor(Math.random() * 1000) + 1000

    this.apollo
      .query({
        query: GET_LISTING,
        variables: {
          id: this.listingId
        }
      })
      .subscribe((res: any) => {
        this.listing = res.data.getListing
      }, (err) => {
        this.router.navigateByUrl('/')
      })

    window.pay = () => this.modalVisibility = false
  }

  ngOnInit (): void {
    this.socket.emit('join', {
      listingId: this.listingId,
      username: this.username
    })

    this.socket.on('username', (res) => {
      this.username = res

      const el = document.createElement('div')
      el.className = 'message'
      el.innerHTML = `<span>Username changed</span>`
      this.messagesEl.nativeElement.prepend(el)
      this.messagesEl.nativeElement.scrollTop = this.messagesEl.nativeElement.scrollHeight
    })

    this.socket.on('message', (res) => {
      const el = document.createElement('div')
      el.className = 'message' + (this.username === res.username ? ' me' : '')
      el.innerHTML = `
        <strong>${res.username}</strong>
        <span>${res.message}</span>
      `
      this.messagesEl.nativeElement.prepend(el)
      this.messagesEl.nativeElement.scrollTop = this.messagesEl.nativeElement.scrollHeight
    })

    this.socket.on('achievement', ({ icon, message }) => {
      this.addNotification(icon, message)
    })
  }

  ngOnDestroy () {
    this.socket.emit('leave')
  }

  sendMessage () {
    if (this.message.startsWith('/')) {
      if (this.message.startsWith('/username')) {
        const s = this.message.split('/username')

        if (s.length === 2) {
          const newUsername = s[1].trim().split(' ')[0]
          this.socket.emit(this.listingId + ':username', newUsername)
        }
      } else if (this.message.startsWith('/checkin')) {
        (window as any).FB.ui({
          display: 'popup',
          method: 'share',
          hashtag: '#hackthecrisis',
          href: window.location.href
        }, (response) => {
          if (response !== undefined) {
            ++this.checkinCount
            if (this.checkinCount === 1) {
              this.addNotification('icon-checkin', 'Achievement unlocked!\nThanks for sharing!')
            }
            return
          }
        })
      } else if (this.message.startsWith('/donate')) {
        this.modalVisibility = true
      }
    } else {
      this.socket.emit(this.listingId + ':message', this.message)
    }
    this.message = ''
  }

  private addNotification (icon, message) {
    const el = document.createElement('div')
    el.className = 'notification toast'
    el.innerHTML = `
      <div class="inner">
        <img class="icon" src="assets/${icon}.png" />
        <div class="message">${message}</div>
      </div>
    `
    document.body.appendChild(el)
    setTimeout(() => el.className += ' visible', 250)

    setTimeout(() => {
      el.className = el.className.replace('visible', '')
      setTimeout(() => document.body.removeChild(el), 2000)
    }, 6000)
  }
}

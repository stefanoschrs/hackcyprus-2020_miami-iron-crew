import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { GraphQLModule } from './graphql.module'
import { HttpClientModule } from '@angular/common/http'
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io'
import { HomePageComponent } from './home-page/home-page.component'
import { ListingPageComponent } from './listing-page/listing-page.component'
import { FormsModule } from '@angular/forms'
import { NgxMapboxGLModule } from 'ngx-mapbox-gl'
import { FilterListingsPipe } from './filter-listings.pipe'
import { environment } from '../environments/environment'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    ListingPageComponent,
    FilterListingsPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    SocketIoModule.forRoot({
      url: environment.chatUrl,
      options: {
        path: environment.chatPath
      }
    }),
    FormsModule,
    NgxMapboxGLModule.withConfig({
      accessToken: environment.mapboxKey
    }),
    InfiniteScrollModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

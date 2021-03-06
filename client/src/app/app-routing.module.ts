import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HomePageComponent } from './home-page/home-page.component'
import { ListingPageComponent } from './listing-page/listing-page.component'

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'listing/:id', component: ListingPageComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

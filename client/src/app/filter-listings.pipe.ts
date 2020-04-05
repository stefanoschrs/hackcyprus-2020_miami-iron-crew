import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'filterListings'
})
export class FilterListingsPipe implements PipeTransform {
  transform (value: any[], searchTerm: string): unknown {
    return value.filter((listing) => {
      if (listing.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true
      }

      if (listing.address.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true
      }

      if (listing.category.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true
      }

      return false
    })
  }
}

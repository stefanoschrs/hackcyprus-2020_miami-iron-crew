const { SQLDataSource } = require('datasource-sql')

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

class MyDatabase extends SQLDataSource {
  getListings () {
    return this.knex
      .select('*')
      .from('listing')
      .cache(7 * DAY)
  }
  getListing (id) {
    if (id === 'miami-iron-crew') {
      return {
        id: 'miami-iron-crew',
        title: 'Miami Iron Crew'
      }
    }

    return this.knex
      .first('*')
      .from('listing')
      .where({
        id
      })
      .cache(7 * DAY)
  }
}

module.exports = MyDatabase

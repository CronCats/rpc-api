import axios from 'axios'
import { supportedCurrencies } from '../helpers/utils'

export const getPrice = async (asset = 'near') => {
  const query = `?ids=${asset}&vs_currencies=${supportedCurrencies.join(',')}`
  const url = `https://api.coingecko.com/api/v3/simple/price${query}`

  try {
    const res = await axios.get(`${url}`)
    return res.data && res.data[asset] ? res.data[asset] : null
  } catch (e) {
    // nothing
  }
}
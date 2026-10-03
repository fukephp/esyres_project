import { gql } from '@apollo/client'

export const SAVE_FAVORITE = gql`
  mutation SaveFavorite($salonId: ID!) {
    saveFavorite(salonId: $salonId) {
      id
      favoriteSalonIds
    }
  }
`

export const UNSAVE_FAVORITE = gql`
  mutation UnsaveFavorite($salonId: ID!) {
    unsaveFavorite(salonId: $salonId) {
      id
      favoriteSalonIds
    }
  }
`

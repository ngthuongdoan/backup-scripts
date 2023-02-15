curl --request POST \
  --url 'https://chat.googleapis.com/v1/spaces/AAAA9i9x1Rw/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=KlBrK2n6KVTD68tRULdKYr6KFzgh9hKL0ZEbI7WqqmM%3D' \
  --header 'Content-Type: application/json' \
  --data '{
    "text":"Merge Request to <users/109196398756093781275>",
        "cardsV2": [
            {
                "cardId": "dfsdf",
                "card": {
                    "header": {
                        "title": "Merge Request to <users/109196398756093781275>",
                        "subtitle": "test",
                        "imageUrl": "https://images.unsplash.com/photo-1495055154266-57bbdeada43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
                        "imageType": "CIRCLE",
                        "imageAltText": "Avatar for Bot"
                    },
                    "sections": [
                        {
                            "header": "Info",
                            "collapsible": true,
                            "uncollapsibleWidgetsCount": 1,
                            "widgets": [
                                {
                                    "decoratedText": {
                                        "startIcon": {
                                            "knownIcon": "HOTEL_ROOM_TYPE"
                                        },
                                        "text": "<users/111394960770002739899>",
                                        "wrapText": true
                                    }
                                },
                                {
                                    "decoratedText": {
                                        "startIcon": {
                                            "knownIcon": "PERSON"
                                        },
                                        "text": "by <users/111394960770002739899>"
                                    }
                                },
                                {
                                  "buttonList": {
                                    "buttons": [
                                      {
                                        "text": "View Merge Request",
                                        "onClick": {
                                            "openLink": {
                                                "url": "https://gitlab.com"
                                            }
                                        }
                                      }
                                    ]
                                  }
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }'
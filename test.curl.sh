curl -X POST -H "Content-Type: application/json" -d '{
  "text":"Dear <users/109196398756093781275> ",
  "cardsV2":[{
    "cardId":"be83cb3e-45f0-40cd-8a2b-9f78b85c14ff",
    "card":{
      "header":{
        "title":"Merge Request (Discover)",
        "imageUrl":"https://images.unsplash.com/photo-1586458873452-7bdd7401eabd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2083&q=80",
        "imageType":"CIRCLE",
        "imageAltText":"Avatar for Bot"
      },
      "sections":[{
        "widgets":[{
          "decoratedText":{
            "topLabel":"Title",
            "text":"sdqwdc",
            "wrapText":true,
            "startIcon":{"knownIcon":"BOOKMARK"}
          }
        },{
          "decoratedText":{
            "topLabel":"Environment",
            "text":"merge into main",
            "startIcon":{"knownIcon":"HOTEL_ROOM_TYPE"}
          }
        }]
      },{
        "widgets":[{
          "text":"If the path before you is clear, youre probably on someone elses. - Joseph Campbell"
        },{
          "buttonList":{
            "buttons":[{
              "text":"View Merge Request",
              "onClick":{
                "openLink":{
                  "url":"https://gitlab.hellohealthgroup.com/hellohealthgroup/hhg-discover-fe/-/merge_requests/610"
                }
              }
            }]
          }
        }]
      }]
    }
  }]
}' "https://chat.googleapis.com/v1/spaces/AAAAUTKGleo/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Qg3mPwLKSIh9tFkE-yzWFUywsstLqA7TGKhn3cdsKhc%3D"

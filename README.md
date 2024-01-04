<a name="readme-top"></a>
[![Contributors][contributors-shield]][contributors-url]
[![Npm][npm-shield]][linkedin-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- ABOUT THE PROJECT -->
## About The Project
`OBJECTIVE:`
* I developed this project to help libraries and bookstores to share their book inventory online.
* Plus a way for libraries to giveaway books to readers in a selective way based on some predefined questions.

`KEY FEATURES:`
* Designed and implemented an API to help the front-end build a user-friendly interface for libraries and bookstores to catalog and share their book inventory.
* Developed a dynamic quiz to determine book giveaways based on user responses to predefined questions.
* Integrated secure authentication mechanisms via email to ensure user data privacy.

`TESTING:`
* Implemented comprehensive unit tests using Jest to ensure the reliability of individual components.
* Conducted API testing using Supertest to validate the functionality and performance of the backend.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Next][Node.js]][Node-url]
* [![Express][Express]][Express-url]
* [![Mongodb][Mongodb]][Mongodb-url]
* [![Jest][Jest]][Jest-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started
### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Make sure you have npm installed on your machine.

2. Clone the repo
   ```sh
   git clone https://github.com/EmadMahmoud/bookstore_back.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Create your own environment variables, In the root folder create 2 files `development.env` and `testing.env`
   ```js
   DATABASE_URL = 'ENTER YOUR DATABASE CONNECTION URL FOR DEVELOPMENT';
   PORT = 3000
   JWTSECRETKEY = 'TYPE HERE YOUR JWT SECRET KEY'
   SENDMAILUSER = 'TYPE THE EMAIL USED BY NODEMAILER'
   SENDMAILPASS = 'TYPE THE PASSWORD GENERATED TO USED BY A THIRD PARTY'
   ```
5. Run the Server
    ```sh
    npm start
    ```
6. Run the Test
    ```sh
    npm test
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Emad Mahmoud : [Twitter](https://twitter.com/EmadMah82323322) - emad.mahmoud.dev@gmail.com




























<p align="right">(<a href="#readme-top">back to top</a>)</p>

[npm-shield]: https://img.shields.io/badge/npm-8.18.0-green?style=for-the-badge&logo=npm&link=https%3A%2F%2Fexpressjs.com%2Fen%2F5x%2Fapi.html&link=left

[contributors-shield]: https://img.shields.io/github/contributors/EmadMahmoud/bookstore_back.svg?style=for-the-badge
[contributors-url]: https://github.com/EmadMahmoud/bookstore_back/graphs/contributors
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/emadmahmoud/

<!-- Built With -->
[Node.js]: https://img.shields.io/badge/Node.js-000000?style=for-the-badge&logo=nodedotjs&logoColor=#339933
[Node-url]: https://nodejs.org/en
[Express]: https://img.shields.io/badge/Express-259DFF?style=for-the-badge&logo=express
[Express-url]: https://expressjs.com/
[Mongodb]: https://img.shields.io/badge/MongoDB-FFC558?style=for-the-badge&logo=mongodb&logoColor=#47A248
[Mongodb-url]: https://www.mongodb.com/
[Jest]: https://img.shields.io/badge/Jest-99425B?style=for-the-badge&logo=jest&logoColor=#99425B
[Jest-url]: https://jestjs.io/docs/getting-started

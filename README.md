This is a simple blog application built using **Next.js**, **Firebase Firestore** (for cloud DB), SQL DB (for local DB), and the [JSONPlaceholder](https://jsonplaceholder.typicode.com/posts) API. 
It allows users to view, create, edit, and count words in blog posts. 



Features:
- Fetch and display posts from Firestore and JSONPlaceholder
- Stores and displays posts from Local SQL DB
- Create and store new posts in Firestore(for cloud)
- Edit existing Firestore posts(cloud)
- Word count using WebAssembly (WASM)
- Responsive design using TailwindCSS
- Pagination for posts
- Hosted on Vercel

  1. Clone the Repo:
     - git clone https://github.com/KanchaMounika/ProjectEnabl.git

  2. Navigate into the project directory:
     - cd ProjectEnabl

  3. Install dependencies:
     - Install npm or yarn

  4. To run the dev server 
     - npm run dev
    In order to clean build and run
     - rm -rf .next (removes old build)
     - npm run dev

  5. Open your browser and go to http://localhost:3000 


  DB configurations:

   For Local DB:
    we need to have a SQL DB setup.
  <img width="756" height="477" alt="image" src="https://github.com/user-attachments/assets/99788f02-c0a1-4e7d-8775-ddd57acfc3c7" />

   For Firestore, Cloud DB we need to have a Firestore DB setup:
  <img width="1822" height="994" alt="image" src="https://github.com/user-attachments/assets/24bcd59c-9cef-4ee9-a9cb-45b389b941a4" />

  Deployment

  This project is deployed on Vercel and can be accessed at:
  https://project-enabl-fp0qayvz5-mounikakanchas-projects.vercel.app/

  Contact
  Created by Mounika Kancha – GitHub

  

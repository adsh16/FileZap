File sending system

MVP
1. Users comes to the website
2. can upload multiple files
3. Generate a link that can be sent to other people
4. Using the link the person can download these files.



Optimization we can make.
1. Use shortend URL.
2. Give functionality to send email to the user with the link.
3. How to reduce the compute used in the process.
4. Can we avoid db storage.
5. Maybe a provide to have the link for longer periods of Time, maybe have the files stored in a S3 bucket.
6. File sent across network should be encrypted.
    - should be encrypted before it leaves the browser
7. send multiple files using same link 
    - we can send them as zip
    - or sending them without zip
8. 
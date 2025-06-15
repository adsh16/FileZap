Backend Project

Project Name : FileZap

File sending system
1. Users comes to the website [x]
2. can upload multiple files [x]
3. Generate a link that can be sent to other people [x]
4. Using the link the person can download these files. [fix download handler]

Todo:
1. Add E2E Encyrtion, using sharable key in link, key never hits the server. 
2. maybe look for option in which we need a password

Optimization we can make.
1. Use shortend URL.
2. Give functionality to send email to the user with the link.
3. How to reduce the compute used in the process.
4. Can we avoid middleware storage.
5. Maybe a protier to have the link for longer periods of Time, maybe have the files stored in a S3 bucket. // using GridFS
6. File sent across network should be encrypted.
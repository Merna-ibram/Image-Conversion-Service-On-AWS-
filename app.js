document.addEventListener("DOMContentLoaded", function(){
    
    // Creating Global Variables for 
    let s3 ;
    let newname;
    let randomID;
    let value;
    let initialOptions = Array.from(document.getElementById("Image").options);
    
    window.onload = function () {

    // Set the region where your identity pool exists (us-east-1, eu-west-1)
    AWS.config.region = 'eu-west-2';

    // Configure the credentials provider to use your identity pool
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'eu-west-2:5b01045d-5aa4-4a91-b563-081ce60f29fa',
    });

    // Make the call to obtain credentials
    AWS.config.credentials.get(function(){

        // Credentials will be available when this function is called.
        var accessKeyId = AWS.config.credentials.accessKeyId;
        var secretAccessKey = AWS.config.credentials.secretAccessKey;
        var sessionToken = AWS.config.credentials.sessionToken;

    });
    
    s3 = new AWS.S3();
       
    }

    function renameFile(fname,newExtension){

        let oldext = fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2);
        randomID = Math.floor(100000 + Math.random() * 900000);
        if (!oldext){

            alert('Invalid file!\nNo extension is included.');
            return;
        }
     
        
        return randomID + '-' + oldext + '-' + newExtension + '.'+ oldext;
    }


    function uploadFile(importedfile,toExtension) {
        
        newname = renameFile(importedfile.name,toExtension);


        const params = {
            Bucket: 'inputbucket-conversion-project', // Replace with your bucket name
            Key: newname,
            Body: importedfile
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file:', err);
                alert('Error uploading file. See console for details.');
            } else {
                console.log('File uploaded successfully:', data);
                alert('File uploaded successfully.');

                ourinterval = setInterval(downloadfile, 5000);
            }
        });

    }

    function downloadfile(){
        const filename= randomID + "-iConvert." + value;
        
        const params = {
            Bucket: 'outputbucket-conversion-project', 
            Key: filename,
        }

        s3.getObject(params, (err, data) => {
            if (err) {
            console.error('Error downloading object:', err);
            
            } else {
            
                // Convert data.Body to a Blob object
                const blob = new Blob([data.Body]);

                // Create a temporary link
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);

                // Set the filename for the downloaded file (optional)
                link.download = filename ;

                // Trigger the download by simulating a click on the link
                link.click();

                // Clean up
                window.URL.revokeObjectURL(link.href);

                clearInterval(ourinterval);
                
            }

        });

    }
        
    
    
    document.getElementById("print").addEventListener("click",function() {
        let e = document.getElementById("Image");
        value = e.value;
        if (e.selectedIndex === 0 && !value){
            alert('Please select a conversion type !!!');
            return;
        }

        const fileInput = document.getElementById('imageInput');
        const file = fileInput.files[0];
        

        if (!file) {
            alert('Please select a file !!!');
            return;
        }
        

        uploadFile(file,value);
        });



    document.getElementById('imageInput').addEventListener('change', function(e) {
        
        let selectobject = document.getElementById("Image");
        let extension = e.target.files[0].name.split('.').pop();
   
        // Remove all options
        selectobject.innerHTML = '';
       
        initialOptions.forEach(option => {
            if (option.value !== extension) {
                selectobject.add(option.cloneNode(true));
            }
        });
    });
})

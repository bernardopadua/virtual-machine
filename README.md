# Virtual Machine

Just a resemblance of a virtual-machine, is actually not a good name, since it's not like a real virtual-machine. It's only purpose it's to practice and learning. 

## Using

Soon..

## Updates

+ 2.0.0
  + Mirrored all actions of pure React to a server-side with more robust access with Websockets.
    + All session maintained using redis and mongodb. Now with login/registration.
+ 1.0.0
  + Created Process Monitor
  + Created Desktop Component
    + Attach event message;
    + Open software on desktop area;
  + Created Softwares
    + Created default software RawText to open file data;
  + EventMessage for Desktop
    + Adpat to attach objects to communicate between VirtualMachine and Desktop;
  + FileSystem
    + Open File;
  + OperatingSystem
    + Many checks and locks to file;
    + Check opened softwares;

## TO-DO

+ Client-Side
  + Open files;
  + Module to communicate via HTTP;
+ Server-Side
  + Build it from the scratch;

## Technologies

+ Babel (ES2015);
  + Transform Class (Static classes);
+ React JS;
+ WebPack;

## Install

In the repository the main 'js' is already transformed. If something changes you will have to install NodeJs with NPM modules.

To install all the modules:
>npm install

To pack and transform the code:
>npm run pack

Any question, just let me know! :)

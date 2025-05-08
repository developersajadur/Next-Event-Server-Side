export interface IProfile {
    id?          :  string        
  name        :  string
  email       :  string       
  password    :  string
  address  ?   :  string
  bio  ?       :  string
  gender ?     :  string
  occupation?  :  string
  phoneNumber :  string        
  profileImage?:  string
  role      :   'ADMIN' | 'USER'       
  isDeleted   : boolean       
  isBlocked  :  boolean      
 

}
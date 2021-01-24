// import AbilityBuilder dan Ability
const { AbilityBuilder, Ability } = require('@casl/ability')

// buat object policy
const policies = {

    guset(user, { can }) {
        can('read', 'Product')
    },

    user(user, { can }) {
        // membaca daftar `Order`
        can('view', 'Order')

        // membuat order
        can('create', 'Order')

        // membaca `Order` miliknya
        can('read', 'Order', { user_id: user._id })

        // mengupdate data dirinya sendiri (`User`)
        can('update', 'User', { _id: user._id })

        // membaca `Cart` miliknya
        can('read', 'Cart', { user_id: user._id })

        // mengupdate `Cart` miliknya
        can('update', 'Cart', { user_id: user.id })

        // melihat daftar `DeliveryAddress` 
        can('view', 'DeliveryAddress')

        // membuat `DeliveryAddress`
        can('create', 'DeliveryAddress', { user_id: user._id })

        // membaca `DeliveryAddress` miliknya
        can('read', 'DeliveryAddress', { user_id: user._id });

        // mengupdate `DeliveryAddress` miliknya
        can('update', 'DeliveryAddress', { user_id: user._id });

        // menghapus `DeliveryAddress` miliknya
        can('delete', 'DeliveryAddress', { user_id: user._id });

        // membaca `Invoice` miliknya
        can('read', 'Invoice', { user_id: user._id });
        //  artinya izinkan membaca invoice jika user_id bernilai sama dengan
        // user._id, alias jika invoice yang mau dilihat adalah miliki user yang sedang login, maka izinkan.
    },

    admin(user, { can }) {
        can('manage', 'all')
    }

}

function policyFor(user) {

    let builder = new AbilityBuilder()

    if (user && typeof policies[user.role] === 'function') {
        policies[user.role](user, builder)
    } else {
        policies['guest'](user, builder)
    }
    return new Ability(builder.rules)
}

module.exports = {
    policyFor
}